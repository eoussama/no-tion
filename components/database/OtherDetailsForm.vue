<script setup lang="ts">
import type { TGenreOption, TMediaType } from "~/core";
import { watchEffect } from "vue";



const props = defineProps<{
  mediaTypeOptions: ReadonlyArray<TMediaType>;
  genreOptions: ReadonlyArray<TGenreOption>;
}>();

const title = defineModel<string>("title", {
  default: "",
});

const type = defineModel<TMediaType>("type", {
  default: "Movie" as TMediaType,
});

const url = defineModel<string>("url", {
  default: "",
});

const posterUrl = defineModel<string>("posterUrl", {
  default: "",
});

const genre = defineModel<TGenreOption>("genre", {
  default: "Other" as TGenreOption,
});

watchEffect(() => {
  if (!type.value && props.mediaTypeOptions.length > 0) {
    type.value = props.mediaTypeOptions[0];
  }
});

watchEffect(() => {
  if (!genre.value && props.genreOptions.length > 0) {
    genre.value = props.genreOptions[0];
  }
});
</script>

<template>
  <div class="movie-details">
    <div class="movie-details-form">
      <div class="form-field">
        <label class="form-label">Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Enter title"
          class="form-input"
        >
      </div>

      <div class="form-field">
        <label class="form-label">Type</label>
        <select v-model="type" class="form-input">
          <option
            v-for="option in props.mediaTypeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label class="form-label">URL</label>
        <input
          v-model="url"
          type="url"
          placeholder="https://..."
          class="form-input"
        >
      </div>

      <div class="form-field">
        <label class="form-label">Poster URL</label>
        <input
          v-model="posterUrl"
          type="url"
          placeholder="https://..."
          class="form-input"
        >
      </div>

      <div class="form-field">
        <label class="form-label">Genre</label>
        <select v-model="genre" class="form-input">
          <option
            v-for="option in props.genreOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <FormReadonlyField label="Franchise" value="Unset" />
    </div>

    <div class="movie-details-poster">
      <div v-if="posterUrl" class="movie-poster">
        <img :src="posterUrl" :alt="title || 'Poster'">
      </div>
      <div v-else class="movie-poster-placeholder">
        <span>No Poster</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-details {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: white;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 3px;
  transition: background 20ms ease-in;
}

@media (max-width: 768px) {
  .movie-details {
    flex-direction: column;
  }
}

@media (prefers-color-scheme: dark) {
  .movie-details {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.094);
  }
}

.movie-details-poster {
  flex-shrink: 0;
  width: 100%;
  max-width: 250px;
}

@media (max-width: 768px) {
  .movie-details-poster {
    max-width: 100%;
    order: 2;
  }

  .movie-details-form {
    order: 1;
  }
}

.movie-poster {
  width: 100%;
  height: auto;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 3px;
}

.movie-poster-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 3px;
  background: rgba(55, 53, 47, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(55, 53, 47, 0.45);
  text-align: center;
  padding: 16px;
}

@media (prefers-color-scheme: dark) {
  .movie-poster-placeholder {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.35);
  }
}

.movie-details-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(55, 53, 47, 0.65);
  margin-bottom: 4px;
}

@media (prefers-color-scheme: dark) {
  .form-label {
    color: rgba(255, 255, 255, 0.45);
  }
}

.form-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  color: var(--color-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  transition: all 20ms ease-in;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(55, 53, 47, 0.16);
}

.form-input:hover {
  box-shadow: inset 0 0 0 1px rgba(55, 53, 47, 0.24);
}

.form-input:focus {
  background: rgba(35, 131, 226, 0.04);
  box-shadow: inset 0 0 0 2px rgba(35, 131, 226, 0.5);
}

.form-input::placeholder {
  color: rgba(55, 53, 47, 0.4);
}

@media (prefers-color-scheme: dark) {
  .form-input {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
  }

  .form-input:hover {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  }

  .form-input:focus {
    background: rgba(35, 131, 226, 0.08);
    box-shadow: inset 0 0 0 2px rgba(35, 131, 226, 0.5);
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
