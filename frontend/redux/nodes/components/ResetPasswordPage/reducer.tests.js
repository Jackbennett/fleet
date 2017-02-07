import expect from 'expect';

import {
  clearResetPasswordErrors,
  resetPassword,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordError,
} from './actions';
import { invalidResetPasswordRequest, validResetPasswordRequest } from '../../../../test/mocks';
import reducer, { initialState } from './reducer';
import { reduxMockStore } from '../../../../test/helpers';

describe('ResetPasswordPage - reducer', () => {
  describe('initial state', () => {
    it('sets the initial state', () => {
      expect(reducer(undefined, { type: 'FAKE-ACTION' })).toEqual(initialState);
    });
  });

  describe('clearResetPasswordErrors', () => {
    it('changes the loading state to true', () => {
      const errorState = {
        ...initialState,
        errors: { base: 'Something went wrong' },
      };

      expect(reducer(errorState, clearResetPasswordErrors)).toEqual({
        ...errorState,
        errors: {},
      });
    });
  });

  describe('resetPasswordRequest', () => {
    it('changes the loading state to true', () => {
      expect(reducer(initialState, resetPasswordRequest)).toEqual({
        ...initialState,
        loading: true,
      });
    });
  });

  describe('resetPasswordSuccess', () => {
    it('changes the loading state to false and errors to null', () => {
      const loadingStateWithError = {
        loading: true,
        errors: { base: 'Something went wrong' },
      };

      expect(reducer(loadingStateWithError, resetPasswordSuccess)).toEqual({
        loading: false,
        errors: {},
      });
    });
  });

  describe('resetPasswordError', () => {
    it('changes the loading state to false and sets the error state', () => {
      const errors = { base: 'There was an error with your request' };

      expect(reducer(initialState, resetPasswordError(errors))).toEqual({
        ...initialState,
        errors,
        loading: false,
      });
    });
  });

  describe('resetPassword', () => {
    const newPassword = 'p@ssw0rd';

    it('dispatches the appropriate actions when successful', (done) => {
      const token = 'valid-password-reset-token';
      const formData = {
        new_password: newPassword,
        password_reset_token: token,
      };
      const request = validResetPasswordRequest(newPassword, token);
      const store = reduxMockStore();

      store.dispatch(resetPassword(formData))
        .then(() => {
          const actions = store.getActions();

          expect(actions).toInclude(resetPasswordRequest);
          expect(actions).toInclude(resetPasswordSuccess);
          expect(request.isDone()).toEqual(true);
          done();
        })
        .catch(done);
    });

    it('dispatches the appropriate actions when unsuccessful', (done) => {
      const token = 'invalid-password-reset-token';

      const formData = {
        new_password: newPassword,
        password_reset_token: token,
      };
      const errors = [{ name: 'base', reason: 'Something went wrong' }];
      const errorResponse = {
        status: 422,
        message: 'Something went wrong',
        errors,
      };
      const invalidRequest = invalidResetPasswordRequest(newPassword, token, errorResponse);
      const store = reduxMockStore();

      store.dispatch(resetPassword(formData))
        .then(done)
        .catch(() => {
          const actions = store.getActions();
          expect(actions).toInclude(resetPasswordError({
            base: 'Something went wrong',
            http_status: 422,
          }));
          expect(invalidRequest.isDone()).toEqual(true);
          done();
        });
    });
  });
});
