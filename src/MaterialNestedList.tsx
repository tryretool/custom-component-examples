import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { Retool } from '@tryretool/custom-component-support'
import { FC } from 'react'
import * as t from 'io-ts'
import { isLeft } from 'fp-ts/lib/Either'

// Interface that represents a tree and maps to JSON so we can have a nested Tree list
interface TreeNode {
  key?: string
  value: string
  children?: Array<TreeNode>
}

const ListTree: FC<{ treeNode: TreeNode; level: number }> = ({ treeNode, level }) => {
  const { key, value, children } = treeNode

  const [selectedItem, setSelectedItem] = Retool.useStateObject({ name: 'selectedItem' })
  const onSelectedItemChanged = Retool.useEventCallback({ name: 'selectedItemChanged' })

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          style={{ paddingLeft: `${level * 20}px` }}
          onClick={() => {
            setSelectedItem({ key: key ?? null, value })
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
  const [data] = Retool.useStateArray({
    name: 'data',
    initialValue: [
      {
        value: 'nodeOne',
        key: 'nodeOne',
        children: [
          {
            value: 'nodeTwo',
            key: 'nodeTwo',
          },
        ],
      },
      { value: 'nodeThree', key: 'nodeThree' },
    ],
  })

  const treeNodes = data.flatMap((n) => {
    const decoded = treeNodeType.decode(n)
    if (isLeft(decoded)) {
      return []
    } else {
      return [decoded.right]
    }
  })

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflow: 'auto' }}>
      <List>
        {treeNodes.map((tree, index) => (
          <ListTree key={tree.key ?? `index-${index}`} treeNode={tree} level={0} />
        ))}
      </List>
    </Box>
  )
}

const treeNodeType: t.Type<TreeNode> = t.recursion('TreeNode', () =>
  t.intersection([
    t.type({
      value: t.string,
    }),
    t.partial({
      children: t.array(treeNodeType),
      key: t.string,
    }),
  ]),
)
