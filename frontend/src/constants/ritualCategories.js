// src/constants/ritualCategories.js

export const RITUAL_CATEGORIES = [
    {
        value: 'WORKOUT',
        label: 'Workout',
        emoji: '💪',
        description: 'Exercise routines',
        examples: 'Leg day, Push day, Cardio...'
    },
    {
        value: 'STUDY',
        label: 'Study Session',
        emoji: '📚',
        description: 'Learning & practice',
        examples: 'Deep work, Review, Practice...'
    },
    {
        value: 'WORK',
        label: 'Work Flow',
        emoji: '💼',
        description: 'Professional tasks',
        examples: 'Morning prep, Project work...'
    },
    {
        value: 'CREATIVE',
        label: 'Creative Session',
        emoji: '🎨',
        description: 'Art & creativity',
        examples: 'Drawing, Music, Writing...'
    },
    {
        value: 'PERSONAL',
        label: 'Personal Care',
        emoji: '🧘',
        description: 'Self-care routines',
        examples: 'Meditation, Skincare...'
    },
    {
        value: 'CUSTOM',
        label: 'Custom',
        emoji: '⚡',
        description: 'Your own mix',
        examples: 'Whatever works for you...'
    }
]

export const TASK_SUGGESTIONS = {
    WORKOUT: [
        'Warm up 10 minutes',
        'Squats 3x8',
        'Deadlifts 3x6',
        'Bench press 3x8',
        'Cool down stretching'
    ],
    STUDY: [
        'Review previous notes',
        'Study new material 30min',
        'Practice problems',
        'Create summary',
        'Test understanding'
    ],
    WORK: [
        'Check emails',
        'Plan daily priorities',
        'Deep work session',
        'Team check-in',
        'Wrap up tasks'
    ],
    CREATIVE: [
        'Setup workspace',
        'Warm up exercises',
        'Main creative work',
        'Review and refine',
        'Clean up'
    ],
    PERSONAL: [
        'Meditation 10min',
        'Gratitude journal',
        'Skincare routine',
        'Relaxation time',
        'Plan tomorrow'
    ]
}