// Environment Configuration
// This file handles all environment variables and configuration

class Environment {
  static get APP_NAME() {
    return process.env.EXPO_PUBLIC_APP_NAME || 'Pet Care Assistant';
  }

  static get APP_VERSION() {
    return process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';
  }

  static get ENVIRONMENT() {
    return process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  }

  static get IS_DEVELOPMENT() {
    return this.ENVIRONMENT === 'development';
  }

  static get IS_PRODUCTION() {
    return this.ENVIRONMENT === 'production';
  }

  static get ANALYTICS_ENABLED() {
    return process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'false';
  }

  static get DEFAULT_LLM_MODEL() {
    return process.env.EXPO_PUBLIC_DEFAULT_LLM_MODEL || 'qwen2:1.5b';
  }

  static get LLM_TIMEOUT() {
    return parseInt(process.env.EXPO_PUBLIC_LLM_TIMEOUT || '60000');
  }

  static get LOCAL_LLM_ONLY() {
    return process.env.EXPO_PUBLIC_LOCAL_LLM_ONLY !== 'false';
  }

  // No validation needed - all local only
  static validate() {
    // No required environment variables for local-only app
    return true;
  }
}

export default Environment;