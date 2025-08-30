"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";

export const AgentsView = () => {
  const router = useRouter()
  const [filters,setFilters] = useAgentsFilters()
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
    ...filters
  }));


  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable 
      data={data.items}
      columns={columns}
      onRowClick={(row)=>router.push(`/agents/${row.id}`)}
      />

      <DataPagination
      page={filters.page}
      totalPages={data.totalPages}
      onPageChange = {(page)=>setFilters({page})}
      />
      {data.items.length === 0 && (
        <EmptyState
        title="Create your first agent"
        description="Create an AI agent that seamlessly joins your meetings, takes accurate notes, highlights key points, and tracks action items. It integrates with calendars and collaboration tools, ensuring no detail is missed. Automate follow-ups, boost productivity, and keep your team aligned with effortless meeting intelligence."

        />
      )}
    </div>
  );
};

export const AgentViewLoading = () => {
  return (
    <LoadingState
      title="Loading Agents"
      description="This may take a few seconds..."
    />
  );
};

export const AgentsViewError = () => {
  return (
    <ErrorState
      title="Error Loading Agents"
      description="Something went wrong !!"
    />
  );
};
