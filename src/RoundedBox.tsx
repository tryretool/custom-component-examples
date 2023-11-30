import { FC } from 'react'
import styles from './RoundedBox.module.scss'
import { useRetoolState } from '@tryretool/custom-component-collections'

export const RoundedBox: FC = () => {
  const [headerText] = useRetoolState('headerText', '')
  const [bodyText] = useRetoolState('bodyText', '')
  return (
    <div className={styles.roundedBoxContainer}>
      <h2>{headerText}</h2>
      <p>{bodyText}</p>
    </div>
  )
}