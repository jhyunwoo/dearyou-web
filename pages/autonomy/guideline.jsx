import BottomBar from "@/components/BottomBar"
import AutonomyPage from "@/components/AutonomyPage"
import { CheckBadgeIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import Layout from "@/components/Layout"
import HeadBar from "@/components/HeadBar"

export default function Autonomy() {
    function Title(props){
        return (
            <div className="flex mt-2 ml-1 items-center stroke-amber-500 text-amber-500 dark:stroke-amber-400 dark:text-amber-400">
                <QuestionMarkCircleIcon className="w-8 h-8"/>
                <div className="ml-1 text-xl font-bold">{props.children}</div>
            </div>
        )
    }
    function Subtitle(props){
        return (
            <div className="font-bold mt-3 ml-1">
                {props.children}
            </div>
        )
    }
    function Paragraph(props){
        return (
            <div className="m-2">
                {props.children}
            </div>
        )
    }
    function Block(props){
        return (
            <div className="my-2 p-4 flex flex-col rounded-lg bg-white dark:bg-slate-900  dark:text-white">
                <div>{props.children}</div>
            </div>
        )
    }
  return (
    <AutonomyPage>
        <Layout>
            <Block>
                <CheckBadgeIcon className="w-24 h-24 mt-10 mb-8 mx-auto stroke-amber-500"/>
                <div className="font-semibold mb-10 text-center">
                    <div className="text-xl">자율위원님, 안녕하세요!</div>
                    <div className="text-lg">&apos;드려유&apos;와 함께할 준비가 되셨나요?</div>
                </div>
            </Block>
            <Block>
                이 페이지는 자율위원이 사용할 수 있는 기능과 규칙을 안내하는
                페이지입니다. 더 궁금한 점이 있다면
                자율(부)위원장 <span className="text-amber-500">우예원/최진우/이준희
                </span> 혹은 Beatus 기획팀 <span className="text-amber-500">김형진
                </span>, 웹사이트 오류가 있거나 기술적 도움이 필요하다면 Beatus
                개발팀 <span className="text-amber-500">전현우/김연준</span>에게
                문의해 주세요.
            </Block>
            <Block>
                <Title>자율위원은 무엇을 하나요?</Title>
                <Paragraph>
                    자율위원은 드려유에 등록되는 물건을 검토 및 승인하고, 부적절한
                    물건이 업로드될 시 등록 신청을 반려하거나 숨길 수 있어요.
                </Paragraph>
            </Block>
            <Block>
                <Title>어떤 기능을 쓸 수 있나요?</Title>
                <Paragraph>
                    <Subtitle>1. 자율위원 전용 페이지</Subtitle>
                    드려유에 올라오는 모든 물건은 자율위원의 승인을 거쳐야
                    다른 사용자들이 볼 수 있어요. 하단 바를 통해 자율위원 페이지로
                    이동하면, 승인 대기 단계의 물건들을 살핀 뒤 등록 신청을 승인하거나
                    반려(거절)할 수 있습니다.

                    <Subtitle>2. 물건 숨기기 버튼</Subtitle>
                    이미 승인된 물건도 부적절하다고 생각한다면
                    임시로 숨김 처리를 할 수 있어요. 물품 정보 페이지 아랫쪽에 있는
                    &apos;물건 숨기기&apos;버튼을 누르면 숨김 처리되며, 자율위원 페이지에서
                    재검토를 거쳐 다시 승인할 수 있습니다.
                </Paragraph>
            </Block>
            <Block>
                <Title>이런 경우 신청을 반려해 주세요</Title>
                <Paragraph>
                    <Subtitle>1. 물건 사진, 제목, 설명을 알아볼 수 없거나 작성하지 않은 경우</Subtitle>
                    <Subtitle>2. 사진/설명이 부적절하거나 초상권, 개인정보를 침해하는 경우</Subtitle>
                    <Subtitle>3. 금전 거래를 목적으로 하는 경우</Subtitle>
                    &quot;... 얼마에 팝니다&quot; 등 금전 거래를 암시하는 문구가 있으면 반려해 주세요.
                    드려유에서는 대가가 없는 나눔이나 비슷한 가격대의 물물 교환만 허용됩니다.
                    <Subtitle>4. 학교에서 나눔/거래하기 부적절한, 고가의 물건을 등록한 경우</Subtitle>
                    시가 기준 6만원 이상을 고가의 물건으로 간주합니다.
                    <Subtitle>5. 부패하기 쉬운 음식물을 등록한 경우</Subtitle>
                    인재관 반입 허용 기준에 어긋나는 음식물은 반려해 주세요.
                </Paragraph>
            </Block>
        </Layout>
        
        <div className="w-full h-8 sm:h-0"></div>

        <HeadBar title={'자율위원 가이드라인'}/>
        <BottomBar />
    </AutonomyPage>
  )
}
