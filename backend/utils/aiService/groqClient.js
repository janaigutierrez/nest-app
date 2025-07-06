import Groq from 'groq-sdk'
//
export class GroqClient {
    constructor() {
        this.client = null
    }

    getClient() {
        if (!this.client) {
            if (!process.env.GROQ_API_KEY) {
                throw new Error('GROQ_API_KEY environment variable is missing')
            }
            this.client = new Groq({ apiKey: process.env.GROQ_API_KEY })
        }
        return this.client
    }

    async generateQuest(systemPrompt, userPrompt) {
        try {
            const completion = await this.getClient().chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                max_tokens: 400,
                response_format: { type: "json_object" }
            })

            const content = completion.choices[0]?.message?.content
            if (!content) {
                throw new Error('Empty response from Groq API')
            }

            return JSON.parse(content)

        } catch (error) {
            if (error.name === 'SyntaxError') {
                console.error('Groq returned invalid JSON:', error.message)
                throw new Error(`Invalid JSON response from AI: ${error.message}`)
            }

            if (error.status === 429) {
                console.error('Groq rate limit exceeded')
                throw new Error('AI service temporarily unavailable (rate limit)')
            }

            if (error.status === 401) {
                console.error('Groq authentication failed')
                throw new Error('AI service authentication failed')
            }

            if (error.status === 400) {
                console.error('Groq bad request:', error.message)
                throw new Error('Invalid request to AI service')
            }

            if (error.status >= 500) {
                console.error('Groq server error:', error.message)
                throw new Error('AI service server error')
            }

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                console.error('Groq connection failed:', error.message)
                throw new Error('Cannot connect to AI service')
            }

            console.error('Groq API Error:', error)
            throw new Error(`AI service error: ${error.message || 'Unknown error'}`)
        }
    }

    async testConnection() {
        try {
            await this.generateQuest(
                "You are a test assistant. Respond with valid JSON.",
                "Respond with: {\"status\": \"ok\", \"test\": true}"
            )
            console.log('✅ Groq connection test successful')
            return true
        } catch (error) {
            console.error('❌ Groq connection test failed:', error.message)
            return false
        }
    }
}