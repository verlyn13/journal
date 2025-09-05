import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toEntryDetailVm, toEntryVm } from '../lib/entryMapper.ts';
import api from '../services/api';
import type { EntryApi, EntryDetailVm, EntryVm } from '../types/entry';

const keys = {
  list: ['entries'] as const,
  item: (id: string) => ['entry', id] as const,
};

export function useEntriesList(enabled: boolean = true) {
  return useQuery({
    queryKey: keys.list,
    queryFn: async (): Promise<EntryVm[]> => {
      const data = (await api.getEntries()) as unknown as EntryApi[];
      return data.map(toEntryVm);
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useEntry(id: string | null) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? keys.item(id) : ['entry', 'empty'],
    queryFn: async (): Promise<EntryDetailVm> => {
      const data = (await api.getEntry(id as string)) as unknown as EntryApi;
      return toEntryDetailVm(data);
    },
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title?: string; content?: string }) => {
      const data = (await api.createEntry({
        title: payload.title ?? '',
        content: payload.content ?? '',
      })) as unknown as EntryApi;
      return data;
    },
    onSuccess: (apiEntry) => {
      const vm = toEntryVm(apiEntry);
      qc.setQueryData<EntryVm[]>(keys.list, (old = []) => [vm, ...old]);
      qc.setQueryData(keys.item(vm.id), toEntryDetailVm(apiEntry));
    },
  });
}
