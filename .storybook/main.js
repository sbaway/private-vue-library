module.exports = {
  addons: [
    '@storybook/addon-knobs/register',
    '@storybook/addon-storysource',
    '@storybook/addon-docs/preset',
    '@storybook/addon-viewport/register',
    '@storybook/addon-actions',
  ],
  stories: ['../stories/**/*.stories.(js|mdx)'],
}
