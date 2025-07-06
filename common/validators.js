const email = (value, name = 'email') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    if (!value.trim().length) throw new Error(`${name} is empty`)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) throw new Error(`${name} is not valid`)
}

const password = (value, name = 'password') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    if (!value.trim().length) throw new Error(`${name} is empty`)
    if (value.length < 8) throw new Error(`${name} must be at least 8 characters`)
    if (!/(?=.*[a-z])/.test(value)) throw new Error(`${name} must contain lowercase letters`)
    if (!/(?=.*[A-Z])/.test(value)) throw new Error(`${name} must contain uppercase letters`)
    if (!/(?=.*\d)/.test(value)) throw new Error(`${name} must contain numbers`)
}

const username = (value, name = 'username') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    if (!value.trim().length) throw new Error(`${name} is empty`)
    if (value.length < 3) throw new Error(`${name} must be at least 3 characters`)
    if (value.length > 20) throw new Error(`${name} cannot exceed 20 characters`)
}

const text = (value, maxLength = 100, minLength = 1, name = 'text') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    if (!value.trim().length) throw new Error(`${name} is empty`)
    if (value.length < minLength) throw new Error(`${name} must be at least ${minLength} characters`)
    if (value.length > maxLength) throw new Error(`${name} cannot exceed ${maxLength} characters`)
}

const id = (value, name = 'id') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    if (!value.trim().length) throw new Error(`${name} is empty`)
    if (!/^[0-9a-fA-F]{24}$/.test(value)) throw new Error(`${name} is not a valid id`)
}

const number = (value, name = 'number') => {
    if (typeof value !== 'number') throw new Error(`${name} is not a number`)
    if (isNaN(value)) throw new Error(`${name} is not a valid number`)
}

const xp = (value, name = 'xp') => {
    number(value, name)
    if (value < 0) throw new Error(`${name} cannot be negative`)
    if (value > 1000) throw new Error(`${name} cannot exceed 1000`)
}

const stat = (value, name = 'stat') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    const validStats = ['STRENGTH', 'DEXTERITY', 'WISDOM', 'CHARISMA']
    if (!validStats.includes(value)) throw new Error(`${name} must be one of: ${validStats.join(', ')}`)
}

const difficulty = (value, name = 'difficulty') => {
    if (typeof value !== 'string') throw new Error(`${name} is not a string`)
    const validDifficulties = ['QUICK', 'STANDARD', 'LONG', 'EPIC']
    if (!validDifficulties.includes(value)) throw new Error(`${name} must be one of: ${validDifficulties.join(', ')}`)
}

const validator = {
    email,
    password,
    username,
    text,
    id,
    number,
    xp,
    stat,
    difficulty
}

export default validator