/*****************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

import Constants from "expo-constants";

const ENV = {
  development: {
    GRAPHQL_URL: "http://localhost:4000/graphql",
    WS_GRAPHQL_URL: "ws://localhost:4000/graphql",
    SERVER_URL: "http://localhost:4000/",
    Expo_CLIENT_ID_GOOGLE:
      "967541328677-2lkpq6a9cj7bnokht7ich14igsi3brs5.apps.googleusercontent.com",
    IOS_CLIENT_ID_GOOGLE:
      "967541328677-uq7f7odvmeea2pb2sq0l7q320ds86536.apps.googleusercontent.com",
    ANDROID_CLIENT_ID_GOOGLE:
      "967541328677-u9lbhmiesp67j3md9b8nk6mkhooeljur.apps.googleusercontent.com",

    AMPLITUDE_API_KEY: "358ef0deb443586e2cc4ddd4380151f0",
    STRIPE_PUBLIC_KEY: "pk_test_lEaBbVGnTkzja2FyFiNlbqtw",
    STRIPE_IMAGE_URL: "http://192.168.100.90:8000/assets/images/logo.png",
    STRIPE_STORE_NAME: "XpressCart",
  },
  staging: {
    GRAPHQL_URL: "http://localhost:4000/graphql",
    WS_GRAPHQL_URL: "ws://localhost:4000/graphql",
    SERVER_URL: "http://localhost:4000/", // put / at the end of server url
    IOS_CLIENT_ID_GOOGLE:
      "94983896797-irt6u2cmq2sjcp7j1rj9m9pqptjd12ue.apps.googleusercontent.com",
    ANDROID_CLIENT_ID_GOOGLE:
      "94983896797-omp6mi32rl3126siafgnskrqql0rdk5c.apps.googleusercontent.com",
    FACEBOOK_APP_ID: "404956210315749",
    AMPLITUDE_API_KEY: "358ef0deb443586e2cc4ddd4380151f0",
    STRIPE_PUBLIC_KEY: "pk_test_lEaBbVGnTkzja2FyFiNlbqtw",
    STRIPE_IMAGE_URL:
      "https://localhost:4000/assets/images/logo.png",
    STRIPE_STORE_NAME: "XpressCart",
  },
  production: {
    GRAPHQL_URL: "http://localhost:4000/graphql",
    WS_GRAPHQL_URL: "ws://localhost:4000/graphql",
    SERVER_URL: "http://localhost:4000/", // put / at the end of server url
    IOS_CLIENT_ID_GOOGLE:
      "94983896797-irt6u2cmq2sjcp7j1rj9m9pqptjd12ue.apps.googleusercontent.com",
    ANDROID_CLIENT_ID_GOOGLE:
      "94983896797-omp6mi32rl3126siafgnskrqql0rdk5c.apps.googleusercontent.com",
    FACEBOOK_APP_ID: "3017447961609878",
    AMPLITUDE_API_KEY: "358ef0deb443586e2cc4ddd4380151f0",
    STRIPE_PUBLIC_KEY: "pk_test_lEaBbVGnTkzja2FyFiNlbqtw",
    STRIPE_IMAGE_URL:
      "https://localhost:4000/assets/images/logo.png",
    STRIPE_STORE_NAME: "XpressCart",
  },
};

const getEnvVars = (env = Constants.manifest/*.releaseChannel*/) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    return ENV.development;
  } else if (env === "production") {
    return ENV.production;
  // } else if (env === "staging") {
  //   return ENV.staging;
  } else {
    return ENV.production;
  }
};

export default getEnvVars;
