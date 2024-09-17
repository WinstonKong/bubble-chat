import { Chunk, findAll } from 'highlight-words-core';
import { UserInfo, ChannelInfo } from '@/app/lib/types';

export function searchGroups(text: string, groups: ChannelInfo[]) {
  let entries: {
    channel: ChannelInfo;
    chunks: Chunk[];
  }[] = [];
  const searchWords = text.split(/\s+/);
  searchWords.push(text);
  groups.forEach((c) => {
    if (!c.name) {
      return;
    }
    let chunks = findAll({
      autoEscape: true,
      caseSensitive: false,
      searchWords: searchWords,
      textToHighlight: c.name,
    });
    if (chunks.find((c) => c.highlight) !== undefined) {
      entries.push({ channel: c, chunks: chunks });
    }
  });
  entries = entries
    .map((e) => {
      const maxMatch = e.chunks
        .filter((c) => c.highlight)
        .sort((a, b) => b.end - b.start - (a.end - a.start))[0];
      const maxMatchLen = maxMatch.end - maxMatch.start;
      return {
        ...e,
        maxMatchLen: maxMatchLen,
      };
    })
    .sort((a, b) => {
      const diff = b.maxMatchLen - a.maxMatchLen;
      return diff !== 0 ? diff : a.channel.name!.localeCompare(b.channel.name!);
    });

  return entries;
}

export function searchUsers(text: string, users: UserInfo[]) {
  let entries: {
    user: UserInfo;
    chunks: Chunk[];
    isNickname: boolean;
  }[] = [];
  const searchWords = text.split(/\s+/);
  searchWords.push(text);
  users.forEach((u) => {
    let chunks = findAll({
      autoEscape: true,
      caseSensitive: false,
      searchWords: searchWords,
      textToHighlight: u.nickname,
    });
    if (chunks.find((c) => c.highlight) === undefined) {
      chunks = findAll({
        autoEscape: true,
        caseSensitive: false,
        searchWords: searchWords,
        textToHighlight: u.username,
      });
      if (chunks.find((c) => c.highlight) !== undefined) {
        entries.push({ user: u, chunks: chunks, isNickname: false });
      }
    } else {
      entries.push({ user: u, chunks: chunks, isNickname: true });
    }
  });
  entries = entries
    .map((e) => {
      const maxMatch = e.chunks
        .filter((c) => c.highlight)
        .sort((a, b) => b.end - b.start - (a.end - a.start))[0];
      const maxMatchLen = maxMatch.end - maxMatch.start;
      return {
        ...e,
        maxMatchLen: maxMatchLen,
      };
    })
    .sort((a, b) => {
      const diff = b.maxMatchLen - a.maxMatchLen;
      return diff !== 0 ? diff : a.user.nickname.localeCompare(b.user.nickname);
    });

  return entries;
}
