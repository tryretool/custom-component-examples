import { useEffect, useState } from 'react'
import { StreamChat, User, Channel } from 'stream-chat'
import {
  Chat,
  Channel as ChannelComponent,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react'
import { type FC } from 'react'

import 'stream-chat-react/dist/css/v2/index.css'
import { Retool } from '@tryretool/custom-component-support'

export const ChatClient: FC = () => {
  const [apiKey, _setApiKey] = Retool.useStateString({ name: 'apiKey' })
  const [userName, _setUserName] = Retool.useStateString({ name: 'userName' })
  const [userId, _setUserId] = Retool.useStateString({ name: 'userId' })
  const [userToken, _setUserToken] = Retool.useStateString({ name: 'userToken' })

  const [chatClient, setChatClient] = useState<StreamChat | undefined>(undefined)
  const [channel, setChannel] = useState<Channel | undefined>(undefined)

  useEffect(() => {
    const user: User = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
    }

    const chatClient = new StreamChat(apiKey)
    setChatClient(chatClient)
    chatClient.connectUser(user, userToken)

    const channel = chatClient.channel('messaging', 'custom_channel_id', {
      image: 'https://www.drupal.org/files/project-images/react.png',
      name: 'Talk about React',
      members: [userId],
    })
    setChannel(channel)
  }, [apiKey, userName, userId, userToken])

  if (chatClient && channel) {
    return (
      <Chat client={chatClient} theme="str-chat__theme-light">
        <ChannelComponent channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </ChannelComponent>
      </Chat>
    )
  } else {
    return null
  }
}
