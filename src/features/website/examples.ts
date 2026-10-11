import { parseWebsiteSpec } from './schema'

export const restaurantWebsite = parseWebsiteSpec({
  name: 'Juniper Table',
  description: 'A neighborhood restaurant celebrating seasonal ingredients.',
  theme: {
    mode: 'dark',
    primaryColor: '#C08457',
    backgroundColor: '#171614',
    textColor: '#F5F1EB',
  },
  sections: [
    {
      id: 'welcome',
      type: 'hero',
      title: 'Gather around the table',
      subtitle: 'Seasonal cooking, made with care and meant to be shared.',
      ctaLabel: 'Explore the menu',
    },
    {
      id: 'menu',
      type: 'features',
      title: 'A taste of the season',
      items: [
        {
          title: 'From nearby farms',
          description: 'Fresh produce from our local growers.',
        },
        {
          title: 'Made in our kitchen',
          description: 'Thoughtful plates prepared every day.',
        },
      ],
    },
    {
      id: 'visit',
      type: 'contact',
      title: 'Come by for dinner',
      address: '14 Garden Lane',
    },
    { id: 'footer', type: 'footer', title: 'Juniper Table' },
  ],
})
