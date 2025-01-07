export default defineAppConfig({
  ui: {
    strategy: 'override',
    primary: 'emerald',
    gray: 'cool',
    button: {
      base: 'focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 flex-shrink-0',
      color: {
        primary: {
          solid:
            'shadow-sm focus:ring-primary-500 focus:ring-offset-primary-200 dark:focus:ring-offset-gray-900 text-primary-50 dark:text-white bg-primary-500 hover:bg-primary-600 disabled:bg-primary-700 aria-disabled:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 dark:disabled:bg-primary-500 dark:aria-disabled:bg-primary-500 focus:ring-2 focus:ring-offset-2 transition ease-in duration-200',
        },
      },
    },
    input: {
      base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0',
      color: {
        primary: {
          outline:
            'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-primary-200 dark:focus:ring-offset-gray-800 transition ease-in-out duration-200',
        },
      },
    },
    notifications: {
      position: 'top-0 bottom-[unset] right-0 left-[unset]',
    },
    skeleton: {
      base: 'animate-pulse',
      background: 'bg-gray-300/60 dark:bg-gray-700',
      rounded: 'rounded-md',
    },
  },
})
