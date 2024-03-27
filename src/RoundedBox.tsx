import { FC } from 'react'
import styles from './RoundedBox.module.scss'
import { Retool } from '@tryretool/custom-component-support'

export const RoundedBox: FC = () => {
  const [headerText] = Retool.useStateString({ name: 'headerText' })
  const [bodyText] = Retool.useStateString({ name: 'bodyText' })
  return (
    <div className={styles.roundedBoxContainer}>
      <h2>{headerText}</h2>
      <p>{bodyText}</p>
    </div>
  )
}
