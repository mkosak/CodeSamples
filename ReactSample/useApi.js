import { useEffect, useReducer, useCallback } from 'react';
import client from '../../../api/Client';

const initState = {
    data: null,
    pending: false,
    error: false,
};

const reducer = (state, action) => {
    const { type, data } = action;
    switch (type) {
        case 'data':
            return { ...state, data, pending: false, error: false };
        case 'error':
            return { ...state, error: data, pending: false };
        case 'pending':
            return { ...state, pending: data, error: false };
        default:
            return { ...state };
    }
};

/**
 * Hook to use Api request with
 * Note: this hook already handle request cancellation with effect
 * @func useApi
 * @param {string} method - literal methods `post`, `get` etc.
 * @param {string} url - endpoint, related to apiUrl in client options, to request
 * @returns {array} - [response object, requestCaller]
 */

export default function useApi(method, url, apiClient) {
    const api = apiClient || client;
    const requester = api[method.toLowerCase()];
    const [response, dispatch] = useReducer(reducer, initState);

    useEffect(
        () => () => {
            api.cancel(url);
        },
        [url, api]
    );

    /**
     * memoized function that will call request
     * @name request
     * @param {...object} args - arguments that will be applied to the request call
     * data, params, options, etc...
     */
    const request = useCallback(
        (data, ...restArgs) => {
            dispatch({ type: 'pending', data: true });
            return requester
                .call(api, url, data, [...restArgs])
                .then((res) => {
                    dispatch({
                        type: 'data',
                        data: res,
                    });
                })
                .catch((e) => {
                    if (!api.isCancel(e)) {
                        dispatch({
                            type: 'error',
                            data: e,
                        });
                    }
                });
        },
        [url, dispatch, requester, api]
    );
    return [response, request];
}
