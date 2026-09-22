import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import {
  boardDisciplineService,
  CreateIncidentPayload,
  IssueStrikePayload,
  RecordCompensationPayload,
  UpdateCompensationStatusPayload,
} from "@/services";

export function useBoardRecommendations(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardDiscipline.recommendations,
    queryFn: () => boardDisciplineService.getRecommendations(status),
  });
}

export function useBoardIncidents(filters?: {
  status?: string;
  category?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.boardDiscipline.incidents,
    queryFn: () => boardDisciplineService.getIncidents(filters),
  });
}

export function useBoardIncidentDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardDiscipline.incident(id),
    queryFn: () => boardDisciplineService.getIncidentById(id),
    enabled: Boolean(id),
  });
}

export function useBoardStrikes(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardDiscipline.strikes(userId),
    queryFn: () => boardDisciplineService.getStrikes(userId),
  });
}

export function useBoardCompensations(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardDiscipline.compensations,
    queryFn: () => boardDisciplineService.getCompensations(userId),
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      payload: CreateIncidentPayload;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.createIncident(params.payload, params.actorUserId, params.actorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.incidents });
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      incidentId: string;
      resolutionNotes: string;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.resolveIncident(
        params.incidentId,
        params.resolutionNotes,
        params.actorUserId,
        params.actorRole
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.incidents });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardDiscipline.incident(variables.incidentId),
      });
    },
  });
}

export function useIssueStrike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { payload: IssueStrikePayload; actorUserId: string; actorRole: string }) =>
      boardDisciplineService.issueStrike(params.payload, params.actorUserId, params.actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.strikes() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardDiscipline.strikes(variables.payload.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.recommendations });
    },
  });
}

export function useOverturnStrike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      strikeId: string;
      reason: string;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.overturnStrike(
        params.strikeId,
        params.reason,
        params.actorUserId,
        params.actorRole
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.strikes() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
    },
  });
}

export function useRecordCompensation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      payload: RecordCompensationPayload;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.recordCompensation(
        params.payload,
        params.actorUserId,
        params.actorRole
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.compensations });
    },
  });
}

export function useUpdateCompensationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      payload: UpdateCompensationStatusPayload;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.updateCompensationStatus(
        params.payload,
        params.actorUserId,
        params.actorRole
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.compensations });
    },
  });
}

export function useReviewRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      recommendationId: string;
      action: "APPLY" | "DISMISS";
      decisionNotes: string;
      actorUserId: string;
      actorRole: string;
    }) =>
      boardDisciplineService.reviewRecommendation(
        params.recommendationId,
        params.action,
        params.decisionNotes,
        params.actorUserId,
        params.actorRole
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.recommendations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.strikes() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.queue });
    },
  });
}
