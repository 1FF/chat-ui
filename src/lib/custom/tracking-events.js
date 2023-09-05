export const standardEventTypes = {
  addToCart: 'AddToCart',
  contact: 'Contact',
  initiateCheckout: 'InitiateCheckout',
  pageView: 'PageView',
  viewContent: 'ViewContent',
  purchase: 'Purchase',
  subscribe: 'Subscribe',
  recurringSubscriptionPayment: 'RecurringSubscriptionPayment',
  cancelSubscription: 'CancelSubscription',
  purchaseFailed: 'PurchaseFailed',
  subscribeFailed: 'SubscribeFailed',
  recurringSubscriptionPaymentFailed: 'RecurringSubscriptionPaymentFailed',
  customerCreated: 'CustomerCreated',
  subscriptionChargeback: 'SubscriptionChargeback',
  subscriptionRefund: 'SubscriptionRefund',
  transactionChargeback: 'TransactionChargeback',
  transactionRefund: 'TransactionRefund',
}

export const customEventTypes = {
  firstMessage: 'FirstMessage',
  linkProvided: 'LinkProvided',
  linkClicked: 'LinkClicked',
  emailField: 'EmailField',
  emailEntered: 'EmailEntered',
  emailWrong: 'EmailWrong',
  emailExist: 'EmailExist',
  priceSeen: 'PriceSeen',
}

export const standard = () => {
  return Object.values(standardEventTypes);
}

export const custom = () => {
  return Object.values(customEventTypes);
}
