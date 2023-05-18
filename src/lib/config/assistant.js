import { roles } from "./roles";

export const assistant = {
  // image: 'https://assets.appsforfit.com/assets/avatars/practitioner-1.png',
  // role: 'Lead Nutrition Expert, PhD',
  // name: 'Jenny Wilson',
  // welcome: 'Chat for 1 min, and get diet advise for free!',
  // ctaTextContent: 'Customize Your Plan!',
  // initialMessage: { role: roles.assistant, content: `Hey there! I'm here to provide nutritional assistance. Let's create the perfect meal plan tailored to your favorite foods. Please share your diet goals with me!`, time: new Date() }
  image: 'https://assets.appsforfit.com/assets/avatars/practitioner-1.png',
  role: 'AI nutritional assistant',
  name: 'MealMentor',
  welcome: 'Chat for 1 min, and get diet advise for free!',
  ctaTextContent: 'Create Your Menu!',
  initialMessage: { role: roles.assistant, content: `Hey there! I'm your personal AI diet consultant. I'd love to learn more about you to create the perfect meal plan and tailor it to your favorite foods. Could you please share your diet goals with me?`, time: new Date() }
};
