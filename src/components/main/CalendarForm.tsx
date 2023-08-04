//fullCalendar
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
//style
import style from './CalendarForm.module.scss'
//react
import { useState, useEffect, useRef } from 'react'
// types
import { DateClickInfo } from '@/types/MainTypes'
//components
import AnnualApplyModal from '@/components/main/AnnualApplyModal'
//api fetch
import { getAnnualApi, getWorkApi } from '@/api/main'
import { getUserAnnualApi, getUserWorkApi } from '@/api/mypage'
//cookie
import { getCookie } from '@/utils/cookie'

interface EventObject {
  title: string
  date: string
  backgroundColor?: string
  borderColor?: string
}

const CalendarForm = () => {
  const date = new Date()
  const initialYear = date.getFullYear()
  const initialMonth = date.getMonth() + 1
  const [currentEvents, setCurrentEvents] = useState<EventObject[]>([])
  // 캘린더 이전, 다음달 변경 시 년/월 정보
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  // 캘린더 정보
  const calendarRef = useRef<FullCalendar>(null)
  // 캘린더 헤더 툴바 버튼
  const [selectText, setSelectText] = useState<string>('전체 연차/당직')
  // 연차 신청 팝업 열기
  const [showModal, setShowModal] = useState(false)
  const [dateClickInfo, setDateClickInfo] = useState<DateClickInfo | null>(null)
  // 유저 정보
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (selectText === '전체 연차/당직') {
      getAllEvents()
    }
    if (selectText === '내 연차/당직') {
      getMyEvents()
    }
  }, [selectText, year, month, currentEvents])

  // 진짜 api함수
  const getAllEvents = async () => {
    const annualData = await getAnnualApi(year, month)
    const workData = await getWorkApi(year, month)
    const annualEvents: EventObject[] = []
    const workEvents: EventObject[] = []
    // 연차 events push
    if (annualData) {
      annualData
        .filter((item) => item.status === 'APPROVED')
        .forEach((item) => {
          annualEvents.push({
            title: item.name + item.employeeNumber,
            date: item.date,
            backgroundColor: '#5b8ce5',
            borderColor: '#5b8ce5'
          })
        })
      annualData
        .filter((item) => item.status === 'CANCELED')
        .forEach((item) => {
          annualEvents.push({
            title: item.name + item.employeeNumber,
            date: item.date,
            backgroundColor: 'rgba(91, 140, 229, 0.5)',
            borderColor: 'rgba(91, 140, 229, 0.5)'
          })
        })
    }
    // 당직 events push
    if (workData) {
      workData.forEach((item) => {
        workEvents.push({
          title: item.name + item.employeeNumber,
          date: item.date,
          backgroundColor: '#ff7976',
          borderColor: '#ff7976'
        })
      })
    }
    const events = [...annualEvents, ...workEvents]
    setCurrentEvents(events)
  }

  const handleDateClick = (info: DateClickInfo) => {
    const current = new Date()
    if (current > info.date) {
      alert('오늘 이전 날짜는 선택할 수 없습니다.')
      return
    }
    setShowModal(true)
    setDateClickInfo(info)
  }

  const getMyEvents = async () => {
    const token = getCookie('token')
    const annualData = await getUserAnnualApi(token, year)
    const workData = await getUserWorkApi(token, year, month)
    const annualEvents: EventObject[] = []
    const workEvents: EventObject[] = []
    // 연차 events push
    if (annualData) {
      annualData
        .filter((item) => item.status === 'APPROVED')
        .forEach((item) => {
          annualEvents.push({
            title: user.name + user.employeeNumber,
            date: item.date,
            backgroundColor: '#5b8ce5',
            borderColor: '#5b8ce5'
          })
        })
      annualData
        .filter((item) => item.status === 'CANCELED')
        .forEach((item) => {
          annualEvents.push({
            title: user.name + user.employeeNumber,
            date: item.date,
            backgroundColor: 'rgba(91, 140, 229, 0.5)',
            borderColor: 'rgba(91, 140, 229, 0.5)'
          })
        })
      annualData
        .filter((item) => item.status === 'UNAPPROVED')
        .forEach((item) => {
          annualEvents.push({
            title: user.name + user.employeeNumber,
            date: item.date,
            backgroundColor: 'rgba(171, 152, 242, 0.5)',
            borderColor: 'rgba(171, 152, 242, 0.5)'
          })
        })
    }
    // 당직 events push
    if (workData) {
      workData.forEach((item) => {
        workEvents.push({
          title: user.name + user.employeeNumber,
          date: item.date,
          backgroundColor: '#ff7976',
          borderColor: '#ff7976'
        })
      })
    }
    const events = [...annualEvents, ...workEvents]
    setCurrentEvents(events)
  }

  const selectHandler = () => {
    setSelectText(selectText === '전체 연차/당직' ? '내 연차/당직' : '전체 연차/당직')
  }

  return (
    <>
      <div className={style.calendarWrapper}>
        <FullCalendar
          ref={calendarRef}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin]}
          headerToolbar={{
            start: 'today select',
            center: 'title',
            end: 'prev next'
          }}
          editable={false}
          selectable={true}
          dateClick={handleDateClick}
          dragScroll={false}
          events={currentEvents}
          eventDurationEditable={false}
          locale="ko"
          customButtons={{
            prev: {
              icon: 'chevron-left',
              click: () => {
                if (calendarRef.current?.getApi()) {
                  calendarRef.current.getApi().prev()
                  const calendarMonth: string = calendarRef.current.getApi().view.title
                  setYear(Number(calendarMonth.split('년')[0]))
                  setMonth(Number(calendarMonth.split('년')[1].split('월')[0]))
                }
              }
            },
            next: {
              icon: 'chevron-right',
              click: () => {
                if (calendarRef.current?.getApi()) {
                  calendarRef.current.getApi().next()
                  const calendarMonth: string = calendarRef.current.getApi().view.title
                  setYear(Number(calendarMonth.split('년')[0]))
                  setMonth(Number(calendarMonth.split('년')[1].split('월')[0]))
                }
              }
            },
            select: {
              text: selectText,
              click: selectHandler
            }
          }}
          eventOrder={(a: any, b: any) => {
            if (a.extendedProps.isAnnual && !b.extendedProps.isAnnual) {
              return -1
            } else if (!a.extendedProps?.isAnnual && b.extendedProps.isAnnual) {
              return 1
            } else {
              return 0
            }
          }}
          height="95%"
          dayMaxEvents={true}
        />
        <div className={style.indicator}>
          <div className={style.item}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#3788d8', marginRight: '10px' }}></div>
            <span>승인된 연차</span>
          </div>
          <div className={style.item}>
            <div
              style={{ width: '10px', height: '10px', backgroundColor: 'rgba(91, 140, 229, 0.5)', marginRight: '10px' }}
            ></div>
            <span>취소 신청된 연차</span>
          </div>
          {selectText === '내 연차/당직' && (
            <div className={style.item}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'rgba(171, 152, 242, 0.5)',
                  marginRight: '10px'
                }}
              ></div>
              <span>신청한 연차</span>
            </div>
          )}
          <div className={style.item}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#ff7976', marginRight: '10px' }}></div>
            <span>당직</span>
          </div>
        </div>
        {showModal && <AnnualApplyModal dateInfo={dateClickInfo as DateClickInfo} setShowModal={setShowModal} />}
      </div>
    </>
  )
}

export default CalendarForm
