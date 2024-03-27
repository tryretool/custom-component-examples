import Input from '@mui/material/Input'
import { Retool } from '@tryretool/custom-component-support'
import { type FC } from 'react'

export const MaterialInput: FC = () => {
  const [value, setValue] = Retool.useStateString({ name: 'value' })
  const [placeholder] = Retool.useStateString({ name: 'placeholder' })

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
