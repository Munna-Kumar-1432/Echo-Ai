import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgenetForm } from "./agent-form";
import { AgentGetOne } from "../../types";

interface UpdatedAgentDialogProps{
    open:boolean;
    onOpenChange:(open:boolean)=>void;
    initialValues:AgentGetOne;
}

export const UpdatedAgentDialog = ({open,onOpenChange,initialValues}:UpdatedAgentDialogProps) =>{
    return (
        <ResponsiveDialog
        title="Edit Agent"
        description="Edit the agent details"
        open={open}
        onOpenChange={onOpenChange}
        >
           <AgenetForm
           onSuccess={()=>onOpenChange(false)}
           onCancel={()=>onOpenChange(false)}
           initialValue={initialValues}
           />
        </ResponsiveDialog>
    )
}