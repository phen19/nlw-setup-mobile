import { View, ScrollView, Text, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { BackButton } from "../components/BackButton";
import dayjs from 'dayjs';
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage"; 
import { HabitEmpty } from "../components/HabitsEmpty";
import clsx from "clsx";

interface Params{
    date:string;
}

interface DayInfoProps{
    completedHabits: string[];
    possibleHabits: {
        id:string;
        title: string
    }[]
}

export function Habit(){
    const [loading, setLoading] = useState(true)
    const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null)
    const [completedHabits, setCompletedHabits] = useState<string[]>([])

    const route = useRoute()
    const {date} = route.params as Params

    const parsedDate = dayjs(date);
    const dayOfWeek = parsedDate.format('dddd');
    const dayAndMonth = parsedDate.format('DD/MM')

    const habitsPogress = dayInfo?.possibleHabits.length 
        ? generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length)
        : 0;

    const isDateInPast = parsedDate.endOf('day').isBefore(new Date())

    async function fetchHabits(){
        try{
            setLoading(true);
            const response = await api.get('day', {params: {date}});
            setDayInfo(response.data)
            setCompletedHabits(response.data.completedHabits)
        }catch(e){
            console.log(e);
            Alert.alert('Ops', 'Não foi possível carregar as informações dos hábitos')
        }finally{
            setLoading(false)
        }

    }

    useEffect(() =>{
        fetchHabits();
    },[])

    async function handleToggleHabit(habitId:string){
       try{
            await api.patch(`/habits/${habitId}/toggle`)
            if(completedHabits.includes(habitId)){
                setCompletedHabits(prevState => prevState.filter(habit=> habit !== habitId))
            }else{
                setCompletedHabits(prevState => [...prevState, habitId])
            }
       }catch(e){
            console.log(e)
            Alert.alert('Ops', 'Não foi possível atualiozar o status do hábito.')
        }
    }
    if(loading){
        return(
            <Loading/>
        )
    }
    return(
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 100}}
             >
                <BackButton/>
                <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
                    {dayOfWeek}
                </Text>
                <Text className=" text-white font-extrabold text-3xl">
                    {dayAndMonth}
                </Text>
                <ProgressBar progress={habitsPogress}/>

                <View className={clsx("mt-6", {
                    ['opacity-50'] :isDateInPast
                })}>
                   {
                    dayInfo?.possibleHabits ?
                        dayInfo?.possibleHabits.map(habit  =>(
                            <Checkbox
                                key={habit.id}
                                title={habit.title}
                                checked={completedHabits.includes(habit.id)}
                                onPress={()=> handleToggleHabit(habit.id)}
                                disabled={isDateInPast}
                            />
                        ))
                    :
                        <HabitEmpty/>
                   }
                </View>

                {
                    isDateInPast && (
                        <Text className="text-white mt-10 text-center">
                            Você não pode editar hábitos de uma data passada.
                        </Text>
                    )
                }
             </ScrollView>
        </View>
    )
}