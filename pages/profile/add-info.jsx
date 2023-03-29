import { useForm } from "react-hook-form";
import pb from "@/lib/pocketbase";

export default function AddInfo() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  async function onSubmit(data) {
    const userUpdate = {
      name: data.userName,
      studentId: data.studentId,
    };
    await pb.collection("users").update(pb.authStore.model.id, userUpdate);
  }

  return (
    <div>
      <div>Add User Info</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>이름</div>
        <input {...register("userName", { required: true })} />
        <div>학번 (6자리)</div>
        <input {...register("studentId", { required: true })} />
        {errors.exampleRequired && <span>This field is required</span>}

        <input type="submit" />
      </form>
    </div>
  );
}
