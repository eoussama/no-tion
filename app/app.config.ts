/**
 * @description
 * Nuxt UI theme: Notion colors and density.
 * `primary` is the custom `notion` blue scale defined in `assets/css/main.css` (`@theme static`); the semantic
 * variables (--ui-bg, --ui-text, ...) and the app tokens used below (`bg-field`, `ring-field-line`, `bg-pop`,
 * `shadow-pop`, `bg-overlay`, ...) are defined there too, for light and dark.
 */
const FIELD = "text-default bg-field ring ring-inset ring-field-line";
const POPUP = "bg-pop shadow-pop ring-0 rounded-lg";

export default defineAppConfig({
  ui: {
    colors: {
      primary: "notion",
      neutral: "stone",
    },

    button: {
      slots: {
        base: "rounded-md font-medium disabled:opacity-50 aria-disabled:opacity-50",
      },
      variants: {
        size: {
          xs: { base: "px-1.5 py-0.5 text-xs gap-1" },
          sm: { base: "px-2 py-1 text-sm gap-1.5", leadingIcon: "size-4", trailingIcon: "size-4" },
          md: { base: "px-3 py-1.5 text-sm gap-1.5", leadingIcon: "size-4", trailingIcon: "size-4" },
          lg: { base: "px-3 py-2 text-sm gap-2", leadingIcon: "size-4", trailingIcon: "size-4" },
        },
      },
      compoundVariants: [
        { color: "primary", variant: "solid", class: "text-white hover:bg-notion-700 active:bg-notion-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" },
        { color: "neutral", variant: "ghost", class: "text-default hover:bg-hover active:bg-active focus-visible:bg-hover" },
        { color: "neutral", variant: "outline", class: "text-default bg-transparent ring-field-line hover:bg-hover active:bg-active" },
        { color: "neutral", variant: "soft", class: "text-default bg-active hover:bg-hover" },
      ],
      defaultVariants: {
        size: "md",
      },
    },

    input: {
      variants: {
        variant: { outline: FIELD, subtle: FIELD },
        size: {
          sm: { base: "px-2 py-1 text-sm gap-1.5", leadingIcon: "size-4", trailingIcon: "size-4" },
          md: { base: "px-2.5 py-1.5 text-sm gap-1.5", leadingIcon: "size-4", trailingIcon: "size-4" },
          lg: { base: "px-3 py-2 text-sm gap-2", leading: "ps-3", leadingIcon: "size-4", trailingIcon: "size-4" },
        },
      },
    },
    textarea: {
      variants: { variant: { outline: FIELD, subtle: FIELD } },
    },
    inputNumber: {
      variants: { variant: { outline: FIELD, subtle: FIELD } },
    },
    select: {
      slots: { content: POPUP },
      variants: { variant: { outline: FIELD, subtle: FIELD } },
    },
    selectMenu: {
      slots: {
        content: POPUP,
        input: "border-b border-default",
        label: "font-normal text-xs text-muted px-2.5 pt-1.5",
        item: "data-highlighted:not-data-disabled:before:bg-hover",
      },
      variants: { variant: { outline: FIELD, subtle: FIELD } },
    },
    inputMenu: {
      slots: {
        content: POPUP,
        item: "data-highlighted:not-data-disabled:before:bg-hover",
      },
      variants: { variant: { outline: FIELD, subtle: FIELD } },
    },
    dropdownMenu: {
      slots: {
        content: POPUP,
        label: "font-normal text-xs text-muted",
        item: "data-highlighted:before:bg-hover",
      },
    },
    popover: {
      slots: { content: POPUP },
    },
    tooltip: {
      slots: { content: "rounded-md" },
    },

    card: {
      slots: { root: "rounded-lg" },
      variants: {
        variant: {
          outline: { root: "bg-card ring-0 shadow-card divide-default" },
        },
      },
    },
    badge: {
      slots: { base: "rounded-[3px] font-normal" },
    },
    kbd: {
      base: "rounded-sm",
    },

    slideover: {
      slots: {
        overlay: "bg-overlay",
        content: "bg-default shadow-pop sm:ring-0 divide-y-0",
        header: "min-h-11 px-3 py-0 sm:px-3",
        body: "px-5 py-5 sm:px-10",
        footer: "border-t border-default px-4 py-3 sm:ps-10 sm:pe-4",
      },
    },
    modal: {
      slots: {
        content: "bg-pop shadow-pop ring-0 rounded-lg divide-default",
      },
      variants: {
        overlay: { true: { overlay: "bg-overlay" } },
      },
    },
    toast: {
      slots: {
        root: "bg-pop shadow-pop ring-0 rounded-lg py-2.5 px-3.5",
        title: "font-medium text-default",
      },
    },
    formField: {
      slots: {
        label: "text-xs font-medium text-muted",
      },
    },
    breadcrumb: {
      slots: {
        list: "gap-0",
        link: "px-1.5 h-6.5 rounded-sm hover:bg-hover font-normal",
        linkLeadingIcon: "size-4",
        separatorIcon: "size-3 text-faint opacity-70",
      },
      variants: {
        active: {
          true: { link: "font-normal" },
          false: { link: "text-default font-normal" },
        },
      },
    },
    commandPalette: {
      slots: {
        item: "data-highlighted:not-data-disabled:before:bg-hover",
      },
    },
    dashboardSearch: {
      slots: {
        modal: "bg-pop shadow-pop ring-0",
      },
    },
    dashboardSidebar: {
      slots: {
        root: "bg-side border-default transition-[width] duration-200 ease-in-out",
        header: "h-auto px-2 pt-2",
        body: "gap-0 px-2 py-0",
        footer: "flex-col items-stretch gap-0.5 border-t border-default p-2",
        content: "bg-side max-w-72",
      },
    },
    dashboardPanel: {
      slots: {
        body: "p-0 sm:p-0 gap-0 sm:gap-0",
      },
    },
    dashboardNavbar: {
      slots: {
        root: "border-b-0 px-3 sm:px-3 ps-4 sm:ps-4 gap-2",
        right: "gap-1",
      },
    },
  },
});
