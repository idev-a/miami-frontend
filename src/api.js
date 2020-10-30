import axios from 'axios'

export const BASE_API = process.env.VUE_APP_BACKEND_URL
// export const BASE_API = 'http://localhost:5000'
// export const BASE_API = 'https://urinotsecure.revampcybersecurity.com'

export const Call = async (url, method, data={}) => {
	let res = {}
	try {
	  res = await axios({
		url: `${BASE_API}/api/${url}`,
		headers: {
		  'Content-Type': 'application/json; charset=utf-8',
		},
		method,
		data
	  })
	} catch(err) {
	  res = err.response
	  if (res && res.status == 403) {
		// authentication token is expired.
		// localStorage.removeItem('jwt')
		// localStorage.setItem('message', err.response.data.message)
		// location.href = '/pages/login'
	  }
	}
	return res.data
  }
  
  export const Post = async (url, data) => {
	return await Call(url, 'POST', data)
  }
  
  export const Get = async (url) => {
	return await Call(url, 'GET')
  }