import { useForm } from "react-hook-form";
import pb from "@/lib/pocketbase";

export default function AddInfo() {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm();
  async function onSubmit(data) {
    const userUpdate = {
      name: data.userName,
      studentId: data.studentId,
    };
    try {
      const result = await pb
        .collection("users")
        .update(pb.authStore.model.id, userUpdate);
      console.log(result);
    } catch {
      console.log("error");
    }
  }

  async function checkStudentId() {
    const records = await pb.collection("users").getFullList({
      filter: `studentId == 210422`,
    });
    console.log(records);
  }

  return (
    <div>
      <div>Add User Info</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>이름</div>
        <input {...register("userName", { required: true })} />
        <div>학번 (6자리)</div>
        <input {...register("studentId", { required: true })} />
        <button onClick={checkStudentId}>학번 중복 확인</button>
        {errors.exampleRequired && <span>This field is required</span>}

        <input type="submit" />
      </form>
    </div>
  );
}
