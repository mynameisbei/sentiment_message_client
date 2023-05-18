import { useEffect, useState, memo } from 'react';
import { debounce } from 'lodash-es';
import { useMutation } from '@tanstack/react-query';
import { useStore } from '@/store';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { checkSessionMessage } from '@/api';
import CustomTextField from '@/components/ui/CustomTextFiled';
import SessionList from './SessionList';

function SessionBar() {
  const { client, session, sessionList, setSession, setSessionList, updatedSessionMap } = useStore(state => state);
  const [searchWord, setSearchWord] = useState('');
  const [filterSessionList, setFilterSessionList] = useState<Session[]>([]);

  const checkMessage = (session: Session) => {
    const newSessionList = sessionList.map(item => {
      return item.id === session.id ? { ...item, unreadCount: 0 } : item;
    });
    setSessionList(newSessionList);
  };

  const debouncedHandleInput = debounce(setSearchWord, 300);

  const { mutateAsync: checkMessageMutate } = useMutation(['checkSessionMessage'], checkSessionMessage);

  useEffect(() => {
    session && client?.emit('joinRoom', { userId: session.fromUser.id, roomId: session.room.id });
    session && session.unreadCount && checkMessageMutate(session.id);
  }, [session]);

  useEffect(() => {
    setFilterSessionList(
      sessionList.filter(session => session.toUser.name.toLowerCase().includes(searchWord.trim().toLowerCase()))
    );
  }, [searchWord, sessionList]);

  return (
    <div className='text-white w-[370px] h-screen py-10 px-8'>
      <CustomTextField
        fullWidth
        placeholder='Search User'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: 'gray' }} />
            </InputAdornment>
          )
        }}
        onChange={(e: any) => debouncedHandleInput(e.target.value)}
        inputProps={{
          style: {
            height: '28px'
          }
        }}
      />
      <SessionList
        data={filterSessionList}
        current={session}
        onSelect={session => {
          checkMessage(session);
          setSession(session);
        }}
      />
    </div>
  );
}

export default memo(SessionBar);
