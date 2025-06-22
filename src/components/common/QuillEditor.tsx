import { useEffect } from "react";
import type { FieldPath, UseFormReturn } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

interface RichTextEditorProps<TFormData extends object> {
  form: UseFormReturn<TFormData>;
  name: FieldPath<TFormData>;
  label: string;
  placeholder?: string;
}


const QuillEditor = <TFormData extends object>({ form, name, label, placeholder }: RichTextEditorProps<TFormData>) => {
  const { setValue, getValues } = form;

  // Cấu hình toolbar của React Quill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  // Đồng bộ giá trị ban đầu từ form
  useEffect(() => {
    const value = getValues(name);
    if (value) {
      setValue(name, value);
    }
  }, [name, getValues, setValue]);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <ReactQuill
          theme="snow"
          value={getValues(name) as string}
          onChange={(value) => setValue(name, value as any, { shouldValidate: true })}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-white mb-7"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export default QuillEditor