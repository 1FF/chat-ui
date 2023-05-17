import { roles } from "./roles";

export const assistant = {
  image: 'https://randomuser.me/api/portraits/women/90.jpg',
  role: 'Lead Nutrition Expert, PhD',
  name: 'Jenny Wilson',
  welcome: 'Have a quick chat with our personal nutritionist and get a free consultation about the perfect diet for you',
  ctaTextContent: 'Visit',
  initialMessage: { role: roles.assistant, content: 'Hi, Im Jenny Wilson, your personal nutritionist. Im here to help you with your nutritional needs.', time: new Date() }
};