import React from 'react'
import StatCard from './StatCard'
import { useStatInfo } from '../../hooks/useStatInfo'

const StatsGrid = ({ user }) => {
    const { getStatInfo } = useStatInfo(user)

    const stats = [
        { key: 'STRENGTH', name: 'Strength', emoji: '💪', color: 'red' },
        { key: 'DEXTERITY', name: 'Dexterity', emoji: '🎯', color: 'green' },
        { key: 'WISDOM', name: 'Wisdom', emoji: '🧠', color: 'blue' },
        { key: 'CHARISMA', name: 'Charisma', emoji: '✨', color: 'purple' }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.map((stat) => (
                <StatCard
                    key={stat.key}
                    stat={stat}
                    statInfo={getStatInfo(stat.key)}
                />
            ))}
        </div>
    )
}

export default StatsGrid