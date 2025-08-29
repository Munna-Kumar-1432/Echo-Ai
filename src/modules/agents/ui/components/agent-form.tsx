import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agenetInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GenerateAvatar } from "@/components/generate-avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValue?: AgentGetOne;
}

export const AgenetForm = ({
  onCancel,
  onSuccess,
  initialValue,
}: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async() => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));

        if (initialValue?.id) {
          queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({
              id: initialValue.id,
            })
          );
        }
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(error.message)

      },
    })
  );

  const form = useForm<z.infer<typeof agenetInsertSchema>>({
    resolver: zodResolver(agenetInsertSchema),
    defaultValues: {
      name: initialValue?.name ?? "",
      instructions: initialValue?.instructions ?? "",
    },
  });

  const isEdit = !!initialValue?.id;
  const isPending = createAgent.isPending;

  const onSubmit = (values: z.infer<typeof agenetInsertSchema>) => {
    if (isEdit) {
      console.log("TODO");
    } else {
      createAgent.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <GenerateAvatar
          seed={form.watch("name")}
          variant="botttsNeutral"
          className="border size-16"
        />

        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Math tutor" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Expert in algebra, geometry, calculus, statistics, trigonometry, probability, logic, fractions, decimals, ratios"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button
              variant={"ghost"}
              disabled={isPending}
              type="button"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          )}

          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
