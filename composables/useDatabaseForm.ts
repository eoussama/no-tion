import type {
  TDatabaseAddRequest,
  TDatabasePage,
  TDatabasePagesResponse,
  TGenreOption,
  TImdbTitle,
  TNullable,
  TToastMessage,
} from "~/core";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, onScopeDispose, reactive, ref, watch } from "vue";
import {
  DEFAULT_GENRE,
  GENRE_OPTIONS,
  MEDIA_TYPE_OPTIONS,
  MediaSourceType,
} from "~/core";



const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

const TITLE_TYPE_MAP: Record<string, string> = {
  movie: "Movie",
  tvSeries: "TV Series",
  tvMiniSeries: "TV Mini-Series",
  tvSpecial: "TV Special",
  tvMovie: "TV Movie",
  tvShort: "TV Movie",
  short: "Short",
  video: "Video",
  videoGame: "Video Game",
};

function formatTitleType(type: string): string {
  return TITLE_TYPE_MAP[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function getDisplayTitle(title: TImdbTitle): string {
  const year = title.startYear ? String(title.startYear) : "N/A";

  return `${title.primaryTitle} (${year})`;
}

/**
 * Provides the state and actions required for the database media form.
 *
 * @param databaseId - The active Notion database identifier.
 * @returns Form state, derived data, and handlers.
 */
export function useDatabaseForm(databaseId: string) {
  const queryClient = useQueryClient();
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  const sourceType = ref<MediaSourceType>(MediaSourceType.IMDB);
  const imdbSearchQuery = ref("");
  const imdbSearchResults = ref<Array<TImdbTitle>>([]);
  const isSearching = ref(false);
  const selectedImdbTitle = ref<TNullable<TImdbTitle>>(null);

  const imdbTitle = ref("");
  const imdbType = ref("");
  const imdbUrl = ref("");
  const imdbPosterUrl = ref("");

  const genre = ref<TGenreOption>(DEFAULT_GENRE);

  const otherForm = reactive({
    title: "",
    type: MEDIA_TYPE_OPTIONS[0],
    url: "",
    posterUrl: "",
  });

  const isSubmitting = ref(false);
  const toast = ref<TNullable<TToastMessage>>(null);

  const { data: existingPagesData } = useQuery<Array<TDatabasePage>>({
    queryKey: ["database-pages", databaseId],
    queryFn: async (): Promise<Array<TDatabasePage>> => {
      const response = await $fetch<TDatabasePagesResponse>(`/api/notion/database/${databaseId}/pages`);

      return response.pages;
    },
    staleTime: 5 * 60 * 1000,
  });

  const existingImdbUrls = computed(() => {
    if (!existingPagesData.value) {
      return new Set<string>();
    }

    return new Set(
      existingPagesData.value
        .map(page => page.infoUrl)
        .filter((url): url is string => url !== null),
    );
  });

  function isMovieInDatabase(imdbId: string): boolean {
    const imdbUrl = `https://www.imdb.com/title/${imdbId}/`;

    return existingImdbUrls.value.has(imdbUrl);
  }

  function resetGenre() {
    genre.value = DEFAULT_GENRE;
  }

  function resetOtherForm() {
    otherForm.title = "";
    otherForm.url = "";
    otherForm.posterUrl = "";
    otherForm.type = MEDIA_TYPE_OPTIONS[0];
  }

  function clearImdbSelection() {
    selectedImdbTitle.value = null;
    imdbTitle.value = "";
    imdbType.value = "";
    imdbUrl.value = "";
    imdbPosterUrl.value = "";
    imdbSearchQuery.value = "";
    imdbSearchResults.value = [];
  }

  watch(sourceType, (type) => {
    resetGenre();

    if (type === MediaSourceType.IMDB) {
      resetOtherForm();
    }
    else {
      clearImdbSelection();
    }
  });

  function selectImdbTitle(title: TImdbTitle) {
    selectedImdbTitle.value = title;
    imdbTitle.value = title.primaryTitle;
    imdbType.value = formatTitleType(title.type);
    imdbUrl.value = `https://www.imdb.com/title/${title.id}/`;
    imdbPosterUrl.value = title.primaryImage?.url ?? "";
    imdbSearchQuery.value = getDisplayTitle(title);
    imdbSearchResults.value = [];
  }

  async function executeSearch() {
    if (imdbSearchQuery.value.length < MIN_SEARCH_LENGTH) {
      imdbSearchResults.value = [];

      return;
    }

    isSearching.value = true;

    try {
      const response = await $fetch<{ titles: Array<TImdbTitle> }>("/api/imdb/search", {
        params: { q: imdbSearchQuery.value },
      });

      imdbSearchResults.value = response.titles ?? [];
    }
    catch {
      imdbSearchResults.value = [];
    }
    finally {
      isSearching.value = false;
    }
  }

  function handleSearchRequest() {
    if (
      !selectedImdbTitle.value
      || imdbSearchQuery.value !== getDisplayTitle(selectedImdbTitle.value)
    ) {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
      }

      searchTimeout = setTimeout(() => {
        void executeSearch();
        searchTimeout = null;
      }, SEARCH_DEBOUNCE_MS);
    }
  }

  watch(imdbSearchQuery, (value) => {
    if (value.length < MIN_SEARCH_LENGTH) {
      imdbSearchResults.value = [];
      isSearching.value = false;
    }
  });

  const isFormValid = computed(() => {
    if (sourceType.value === MediaSourceType.IMDB) {
      return Boolean(selectedImdbTitle.value && imdbUrl.value);
    }

    return Boolean(otherForm.title && otherForm.url && otherForm.type);
  });

  function pushToast(message: string, type: TToastMessage["type"]) {
    toast.value = { message, type };
    setTimeout(() => {
      toast.value = null;
    }, 3000);
  }

  onScopeDispose(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  });

  async function handleSubmit() {
    if (!isFormValid.value || isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;

    try {
      const basePayload: TDatabaseAddRequest = {
        databaseId,
        title: sourceType.value === MediaSourceType.IMDB ? imdbTitle.value : otherForm.title,
        type: sourceType.value === MediaSourceType.IMDB ? imdbType.value : otherForm.type,
        url: sourceType.value === MediaSourceType.IMDB ? imdbUrl.value : otherForm.url,
        genre: genre.value,
      };

      if (sourceType.value === MediaSourceType.IMDB && imdbPosterUrl.value) {
        basePayload.posterUrl = imdbPosterUrl.value;
      }
      else if (sourceType.value === MediaSourceType.OTHER && otherForm.posterUrl) {
        basePayload.posterUrl = otherForm.posterUrl;
      }

      await $fetch("/api/notion/database/add", {
        method: "POST",
        body: basePayload,
      });

      await queryClient.invalidateQueries({ queryKey: ["database-pages", databaseId] });

      if (sourceType.value === MediaSourceType.IMDB) {
        clearImdbSelection();
      }
      else {
        resetOtherForm();
      }

      resetGenre();
      pushToast("Entry added successfully!", "success");
    }
    catch {
      pushToast("Failed to add entry. Please try again.", "error");
    }
    finally {
      isSubmitting.value = false;
    }
  }

  return {
    sourceType,
    imdbSearchQuery,
    imdbSearchResults,
    isSearching,
    selectedImdbTitle,
    imdbTitle,
    imdbType,
    imdbUrl,
    imdbPosterUrl,
    genre,
    otherForm,
    isSubmitting,
    toast,
    genreOptions: GENRE_OPTIONS,
    mediaTypeOptions: MEDIA_TYPE_OPTIONS,
    isFormValid,
    isMovieInDatabase,
    handleSearchRequest,
    selectImdbTitle,
    clearImdbSelection,
    resetOtherForm,
    handleSubmit,
  };
}
