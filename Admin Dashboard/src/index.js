/* eslint-disable camelcase */
import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import gql from 'graphql-tag'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloLink, split, concat, Observable } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as firebase from 'firebase/app'
import 'firebase/messaging'
import 'assets/vendor/nucleo/css/nucleo.css'
import 'assets/vendor/@fortawesome/fontawesome-free/css/all.min.css'
import 'assets/scss/argon-dashboard-react.scss'
import { getOrders, uploadToken } from '../src/apollo/server'

import { ws_server_url, server_url } from './config/config'
import App from './app'
const GET_ORDERS = gql`
  ${getOrders}
`
const UPLOAD_TOKEN = gql`
  ${uploadToken}
`

const firebaseConfig = {
  apiKey: 'AIzaSyBcjrjzQj4_lGFGVzwa8YIkWyBZaSRZBl8',
  authDomain: 'xpresscart-app.firebaseapp.com',
  databaseURL: 'https://xpresscart-app-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'xpresscart-app',
  storageBucket: 'xpresscart-app.firebasestorage.app',
  messagingSenderId: '765533190793',
  appId: '1:765533190793:web:41bdf20021cf8256d2a458'
}

const cache = new InMemoryCache()
const httpLink = createHttpLink({
  uri: `${server_url}graphql`
})
const wsLink = new WebSocketLink({
  uri: `${ws_server_url}graphql`,
  options: {
    reconnect: true
  }
})

const request = async operation => {
  const data = localStorage.getItem('user-xpresscart')
  let token = null
  if (data) {
    token = JSON.parse(data).token
  }
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  })
}

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      console.log(observer)
      let handle
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          })
        })
        .catch(observer.error.bind(observer))

      return () => {
        if (handle) handle.unsubscribe()
      }
    })
)

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink
  // httpLink,
)

const client = new ApolloClient({
  link: concat(ApolloLink.from([terminatingLink, requestLink]), httpLink),
  cache
})

// // Initialize Firebase
firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()
messaging.usePublicVapidKey(
  'BBgLGce11FmnLBMeaDgwUBmag56NiTjWb7ANSjdBTYCQW4YuK7czQ3BovDEcJo-8Hclmbd-CnjyigWx1PNwW_DY'
)
messaging
  .requestPermission()
  .then(function() {
    messaging
      .getToken()
      .then(function(currentToken) {
        if (currentToken) {
          client
            .mutate({
              mutation: UPLOAD_TOKEN,
              variables: { pushToken: currentToken }
            })
            .then(() => {})
            .catch(() => {})
        } else {
        }
      })
      .catch(function() {})
  })
  .catch(function() {})

messaging.onMessage(function(payload) {
  var notificationTitle = 'New Order on XpressCart'
  var notificationOptions = {
    body: payload.data.orderid,
    icon: '/favicon.png'
  }
  const nt = new Notification(notificationTitle, notificationOptions)
  nt.onclick = function(event) {
    event.preventDefault() // prevent the browser from focusing the Notification's tab
    window.open(server_url)
    nt.close()
  }
  // console.log('Message received. ', payload);
  client.query({ query: GET_ORDERS, fetchPolicy: 'network-only' })
})
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
