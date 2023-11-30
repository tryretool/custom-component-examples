import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useRetoolEventCallback, useRetoolState } from '@tryretool/custom-component-collections'
import { FC } from 'react'

// Interface that represents a tree and maps to JSON so we can have a nested Tree list
interface TreeNode {
  key?: string
  value: string
  children?: TreeNode[]
}

const ListTree: FC<{ treeNode: TreeNode; level: number }> = ({ treeNode, level }) => {
  const { key, value, children } = treeNode

  const [selectedItem, setSelectedItem] = useRetoolState<TreeNode | null>('selectedItem', null)
  const onSelectedItemChanged = useRetoolEventCallback('selectedItemChanged')

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => {
            setSelectedItem({ key, value })
            onSelectedItemChanged()
          }}
          selected={selectedItem?.key === treeNode.key}
        >
          <ListItemText primary={value} />
        </ListItemButton>
      </ListItem>
      <List component="div" disablePadding>
        {children?.map((child) => <ListTree key={child.key} treeNode={child} level={level + 1} />)}
      </List>
    </>
  )
}

export const MaterialNestedList: FC = () => {
  // Replace this with your actual data fetching logic
  const [data] = useRetoolState<TreeNode[]>('data', [])

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflow: 'auto' }}>
      <List>
        {data.map((tree, index) => (
          <ListTree key={tree.key ?? `index-${index}`} treeNode={tree} level={0} />
        ))}
      </List>
    </Box>
  )
}