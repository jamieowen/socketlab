
module.exports = {

    // session states.
    SESSION_CONNECT: 'session-connect',
    SESSION_CONNECTED: 'session-connected',
    SESSION_CONNECT_ERROR: 'session-connect-error',

    SESSION_START: 'session-start',
    SESSION_STARTED: 'session-started',
    SESSION_START_ERROR: 'session-start-error',

    SESSION_END: 'session-end',
    SESSION_ENDED: 'session-ended',
    SESSION_END_ERROR: 'session-end-error',

    // fetching history
    HISTORY_FETCH: 'history-fetch',
    HISTORY_FETCHED: 'history-fetched',
    HISTORY_ERROR: 'history-error',

    // send data
    SEND_CONFIG: 'send-config',
    SEND_MESSAGE: 'send-message',
    SEND_POINT: 'send-point',

    // session events - sent to all connections.
    ADDED: 'global-session-start',
    REMOVED: 'global-session-end',
    MESSAGE: 'global-message',
    POINT: 'global-point',
    CONFIG: 'global-config'

};