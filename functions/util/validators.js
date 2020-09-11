const isEmail = arg_email => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (arg_email.match(emailRegEx)) {
        return true
    } else {
        return false
    }
}
const isEmpty = arg_str => {
    if (arg_str.trim() === '') {
        return true
    } else {
        return false
    }
}

exports.validateSignupData = newUser => {
    let errors = {} //bắt buộc phải reset "errors"
    const { handle, email, password, confirmPassword } = newUser
    if (isEmpty(email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(email)) {
        errors.email = 'Must be a valid email'
    }
    if (isEmpty(password)) {
        errors.password = 'Must not be empty'
    }
    if (isEmpty(handle)) {
        errors.handle = 'Must not be empty'
    }
    if (password !== confirmPassword) {
        errors.confirmPassword = 'PW must match'
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = req_body => {
    let errors = {} //bắt buộc phải reset "errors"
    const { email, password } = req_body
    if (isEmpty(email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(email)) {
        errors.email = 'Must be a valid email'
    }
    if (isEmpty(password)) {
        errors.password = 'Must not be empty'
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = data => {
    let userDetails = {} //bắt buộc phải reset "userDetails"
    const { bio, website, location } = data
    if (!isEmpty(bio.trim())) {
        userDetails.bio = bio
    }
    if (!isEmpty(location.trim())) {
        userDetails.location = location
    }
    if (!isEmpty(website.trim())) {
        //https://website.com
        if (website.trim().substring(0, 4) !== 'http') {
            userDetails.website = `http://${website.trim()}`
        } else {
            userDetails.website = website
        }
    }
    return userDetails
}