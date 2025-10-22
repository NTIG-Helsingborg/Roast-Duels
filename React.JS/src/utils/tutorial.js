export const tutorialUtils = {
  hasCompletedTutorial() {
    return localStorage.getItem('tutorialCompleted') === 'true';
  },

  markTutorialCompleted() {
    localStorage.setItem('tutorialCompleted', 'true');
  },

  resetTutorial() {
    localStorage.removeItem('tutorialCompleted');
    localStorage.removeItem('hasVisitedBefore');
    console.log('Tutorial reset - will show on next login');
  },

  isFirstTimeUser() {
    const isFirstTime = !this.hasCompletedTutorial() && !localStorage.getItem('hasVisitedBefore');
    console.log('isFirstTimeUser check:', {
      hasCompletedTutorial: this.hasCompletedTutorial(),
      hasVisitedBefore: localStorage.getItem('hasVisitedBefore'),
      isFirstTime
    });
    return isFirstTime;
  },

  markVisited() {
    localStorage.setItem('hasVisitedBefore', 'true');
    console.log('User marked as visited');
  },

  forceShowTutorial() {
    this.resetTutorial();
    console.log('Tutorial will be forced to show');
  }
};
