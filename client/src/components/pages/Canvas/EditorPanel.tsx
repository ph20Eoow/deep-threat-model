import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/app";

const EditorPanel = () => {
  const { description, assumptions } = useAppStore();
  const onChangeTextEditor = (e: React.ChangeEvent<HTMLTextAreaElement>, target: "description" | "assumptions") => {
    useAppStore.getState().updateUserInput(e.target.value, target);
  };
  return (
    <div className="flex flex-col h-full p-2">
      <p className="text-sm font-medium">Description</p>
      <Textarea rows={10} value={description} onChange={(e) => onChangeTextEditor(e, "description")} />
      <p className="text-sm font-medium">Assumptions</p>
      <Textarea rows={10} value={assumptions} onChange={(e) => onChangeTextEditor(e, "assumptions")} />
    </div>
  );
};

export default EditorPanel;
