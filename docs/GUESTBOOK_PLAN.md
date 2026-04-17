# Guestbook Implementation Plan

## Proto Definition
- [ ] Define `GuestbookService` with `PostMessage` and `GetMessages` RPCs.
- [ ] Define request and response messages for `PostMessage` and `GetMessages`.

## Backend Implementation (Go + Valkey)
- [ ] Implement the `GuestbookService` handler in Go.
- [ ] Set up and configure the Valkey client.
- [ ] Implement storage logic (e.g., using a Redis List or Sorted Set) to store messages.
- [ ] Implement rate limiting logic using Valkey (e.g., based on IP using `INCR` and `EXPIRE`).
- [ ] Add input validation (e.g., max length, preventing empty messages).

## Frontend Implementation (SvelteKit)
- [ ] Create a new Guestbook page/route in SvelteKit.
- [ ] Implement the message submission form.
- [ ] Implement the logic to fetch and display existing messages.
- [ ] Handle and display error responses from the backend (e.g., "Too many requests").

## Infrastructure & Testing
- [ ] Update `make generate`  if necessary.
- [ ] Write unit tests for the Go backend storage and rate limiting logic.
- [ ] Perform end-to-end testing of the full flow from frontend to backend.
