# Changelog

### 0.7.0 (Nov 20, 2018)

New Functionality:

- Add support for axios instance so default values can be used across multiple requests
- Add support for multiple options configs when polling
- Add support Axios config optionally being a function that receives app state

Fixes:

- Fix poll timeout causing first request to be delayed the amount of the pollInterval
- Fix poll request not supporting `Axios.all()`
