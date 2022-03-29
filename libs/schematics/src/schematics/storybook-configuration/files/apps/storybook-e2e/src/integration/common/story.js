import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I am in the {string} Story', storyId => {
  cy.visit(`/iframe.html?id=${storyId}`);
})
