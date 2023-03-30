import { useForm } from "react-hook-form";
import pb from "@/lib/pocketbase";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AddInfo() {
  const [validStudentId, setValidStudentId] = useState(false);

  const router = useRouter();

  // React Hook Form 에서 기능 가져오기
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  /** 사용자가 입력한 이름과 학번을 사용자 계정에 업데이트 */
  async function onSubmit(data) {
    const userUpdate = {
      name: data.userName,
      studentId: data.studentId,
    };
    if (validStudentId) {
      try {
        await pb.collection("users").update(pb.authStore.model.id, userUpdate);
        // 데이터 업데이트 완료 후 사용자를 메인 페이지로 이동
        router.replace("/");
      } catch {
        console.error("error");
      }
    } else {
      alert("학번을 확인해야 합니다.");
    }
  }

  /** 사용자가 입력한 학번이 등록된 학번인지 확인 */
  async function checkStudentId() {
    const records = await pb.collection("users").getFullList({
      filter: `studentId = ${getValues("studentId")}`,
    });
    if (records.length > 0) {
      alert("이미 등록된 학번입니다.");
    } else {
      alert("등록 가능한 학번입니다.");
      setValidStudentId(true);
    }
  }

  return (
    <div>
      <div>Add User Info</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>이름</div>
        <input
          {...register("userName", {
            required: true,
            minLength: { value: 2, message: "올바른 이름을 입력해주세요" },
            maxLength: { value: 4, message: "올바른 이름을 입력해주세요" },
          })}
        />
        {errors.userName && <span>{errors.userName.message}</span>}
        <div>학번 (6자리)</div>
        <input
          {...register("studentId", {
            required: true,
            min: { value: 210101, message: "올바른 학번을 입력해주세요" },
            max: { value: 999999, message: "올바른 학번을 입력해주세요" },
          })}
        />
        {errors.studentId && <span>{errors.studentId.message}</span>}

        <button type="submit">제출</button>
      </form>
      <button onClick={checkStudentId}>학번 중복 확인</button>
    </div>
  );
}
