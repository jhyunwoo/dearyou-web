import AutonomyPage from "@/components/AutonomyPage"
import Image from "next/image"
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"
import Link from "next/link"

export default function Guideline() {
  function Title(props) {
    return (
      <div className="flex mt-2 ml-1 items-center stroke-amber-500 text-amber-500 dark:stroke-amber-400 dark:text-amber-400">
        <QuestionMarkCircleIcon className="w-8 h-8" />
        <div className="ml-1 text-xl font-bold">{props.children}</div>
      </div>
    )
  }
  function Subtitle(props) {
    return <div className="font-bold mt-3 ml-1">{props.children}</div>
  }
  function Paragraph(props) {
    return <div className="m-2">{props.children}</div>
  }
  function Block(props) {
    return (
      <div className="my-2 p-4 flex flex-col rounded-lg bg-white dark:bg-slate-900  dark:text-white">
        <div>{props.children}</div>
      </div>
    )
  }
  return (
    <Layout>
      <Block>
        <Image
          src="/favicon.png"
          width={128}
          height={128}
          className="mt-8 mx-auto"
          alt="dearyou logo"
        />
        <div className="font-semibold mt-4 mb-8 text-center">
          <div className="text-xl">드려유(DearYou)</div>
          <div className="text-lg">안내 페이지</div>
        </div>
      </Block>
      <Block>
        <Paragraph>
          안녕하세요. &apos;드려유&apos;의 기능과 이용 규칙을 안내하는
          페이지입니다. 원활한 서비스 이용을 위해{" "}
          <span className="font-bold">반드시 정독</span> 부탁드려요!
        </Paragraph>
      </Block>
      <Block>
        <Title>드려유가 뭔가유?</Title>
        <Paragraph>
          &apos;드려유&apos;는 우리{" "}
          <span className="text-blue-400">충남삼성고</span>에서 교과서, 풀지
          않은 문제집, 학용품 등을 쉽게 나누고 교환할 수 있는 온라인
          플랫폼입니다!
        </Paragraph>
        <Paragraph>
          드려유는 IT 개발 동아리 <span className="text-amber-500">Beatus</span>
          와 <span className="text-amber-500">자율위원단</span>이 개발 및
          운영하며, 한시적으로 운영되는 이벤트성 플랫폼입니다. 운영 기간은
          7.11(화) ~ 7.14(금)이에요.
        </Paragraph>
      </Block>
      <Block>
        <Title>무엇을 할 수 있나요?</Title>
        <Paragraph>
          <Subtitle>1. 물건 나누기</Subtitle>
          풀지 않을 거지만 버리긴 아까운 문제집이 있나요? 드려유에서 내가 가진
          물건이 필요한 사람을 쉽게 찾고 물건을 나눔할 수 있어요. 플러스(+)
          아이콘을 눌러 물건 정보를 올리면 자율위원의 승인을 거쳐 물건이
          등록됩니다.
          <Subtitle>2. 물건 찾기</Subtitle>
          메인 페이지에는 다른 사람들이 올린 물건들이 보여요. 사진, 설명 등
          정보를 확인하고 물건을 나눔받길 원한다면 채팅 기능으로 물건을 올린
          사람에게 문의가 가능합니다.
          <Subtitle>3. 채팅</Subtitle>
          채팅 기능을 통해 물건의 상태를 확인하거나 물건을 전달할 시간, 장소를
          조율할 수 있어요.
          <Subtitle>4. 나눔 완료 & 후기 작성</Subtitle>
          물건을 전달한 뒤, 등록한 사람이 &apos;나눔 완료&apos; 버튼을 누르면 더
          이상 문의할 수 없게 되고, 준 사람과 받은 사람 둘 다 후기를 작성할 수
          있어요. 후기를 작성하면 &apos;품격 온도&apos;가 오르는데, 운영 기간이
          끝난 후 품격 온도가 높은 학생들에게 소정의 상품을 지급할 예정입니다.
        </Paragraph>
      </Block>
      <Block>
        <Title>물건 등록 시 주의사항</Title>
        <Paragraph>
          <Subtitle>
            1. 물건을 올리는 즉시 메인 페이지에서 보이지는 않아요.
          </Subtitle>
          부적절한 물건의 등록을 방지하기 위해, 모든 물건은 자율위원의 검토를
          거친 뒤 등록됩니다. 다만 아직 검토되지 않은 물건도 프로필 → &apos;내가
          등록한 물건&apos; 페이지에서 확인하거나 수정할 수 있어요.
          <Subtitle>
            2. 물건 사진, 제목, 설명을 통해 물건의 종류와 상태를 알아볼 수
            있도록 해 주세요.
          </Subtitle>
          <Subtitle>3. 금전이 오가는 거래는 불가합니다.</Subtitle>
          물건 나눔(혹은 물물교환)의 용도로만 서비스를 이용해 주세요.
          <Subtitle>
            4. 학교에서 거래하기 부적절한 물건은 등록을 지양해 주세요.
          </Subtitle>
          지나친 고가의 물건, 음식물 등의 경우는 등록 신청이 거절될 수 있습니다.
        </Paragraph>
      </Block>
      <Block>
        <Title>이외 주의사항</Title>
        <Paragraph>
          비매너 채팅 금지, 초상권 침해 금지 등은 굳이 말하지 않아도 되겠죠?
          CNSAian의 품격을 지켜 주세요! (만일 불미스러운 일이 발생한다면
          운영진은 사용자에게 계정 차단 조치를 취할 수 있으며, 활동 기록을
          조회하는 것도 가능합니다.)
        </Paragraph>
      </Block>
      <Block>
        <Paragraph>
          읽어 주셔서 감사합니다! 프로필 → &apos;도움말&apos; 버튼을 눌러 언제든
          이 페이지로 돌아올 수 있습니다. 더 궁금한 점이 있다면 드려유
          고객센터를 이용해 주세요.
        </Paragraph>
      </Block>

      <div className="flex mb-10">
        <Link
          href={"/"}
          className="mx-auto bg-amber-500 dark:text-white hover:bg-amber-600 transition duration-200 text-white p-4 rounded-lg mb-2 font-bold"
        >
          가보자고~
        </Link>
      </div>

      <HeadBar title={"드려유 안내 페이지"} />
    </Layout>
  )
}
