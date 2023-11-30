import Input from '@mui/material/Input'
import { type FC } from 'react'
import { useRetoolState } from '@tryretool/custom-component-collections'

export const MaterialInput: FC = () => {
  const [value, setValue] = useRetoolState('value', '')
  const [placeholder] = useRetoolState('placeholder', '')

  return (
    <Input
      sx={{ width: '100%', height: '100%' }}
      placeholder={placeholder}
      inputProps={{ 'aria-label': 'description' }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}