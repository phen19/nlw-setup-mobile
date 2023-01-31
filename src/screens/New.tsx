import { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import {Feather} from '@expo/vector-icons'
import colors from "tailwindcss/colors";
import { api } from "../lib/axios";


const availableWeekDays = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira","Sábado"]

export function New(){
    const [title, setTitle] = useState('')
    const [weekDays, setWeekDays] = useState<number[]>([]);

    function handleToggleWeekDay(weekDayIndex:number){
        if(weekDays.includes(weekDayIndex)){
            setWeekDays(prevState=> prevState.filter(weekDay => weekDay !== weekDayIndex))
        }else{
            setWeekDays(prevState=>[...prevState, weekDayIndex])
        }
    }
    
    async function handleCreateNewHabit(){
        try{
            console.log(title)
            if(!title.trim || weekDays.length === 0 || title === ""){
               return Alert.alert('Novo hábito', 'Informe o nome do hábito e escolha a periodicidade')
            }

            await api.post("habits", {title, weekDays})
            setTitle("")
            setWeekDays([])
            Alert.alert('Novo hábito', 'Hábito criado com sucesso')
        }catch(e){
            console.log(e)
            Alert.alert('Ops', 'Não foi possível criar o novo hábito.')
        }
    }

    return(
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100}}>
                <BackButton/>

                <Text className="mt-6 text-white font-extrabold text-3xl">
                    Criar Hábito
                </Text>

                <Text className="mt-6 text-white font-semibold text-base">
                    Qual seu comprometimento?
                </Text>

                <TextInput
                    className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white focus:border-2 border-zinc-800 focus:border-green-600"
                    placeholder="Ecercicios, dormir bem, etc"
                    placeholderTextColor={colors.zinc[400]}
                    onChangeText={setTitle}
                    value={title}
                />

                <Text className="font-semibold mt-4 mb-3 text-white text-base">
                    Qual a recorrência?
                </Text>

                {
                    availableWeekDays.map((weekday, index) =>(
                        <Checkbox
                            key={weekday}
                            title={weekday}
                            checked={weekDays.includes(index)}
                            onPress={()=> handleToggleWeekDay(index)}
                        />
                    ))
                }
                <TouchableOpacity
                    className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6"
                    activeOpacity={0.7}
                    onPress={handleCreateNewHabit}
                >
                    
                    <Feather
                        name="check"
                        size={20}
                        color={colors.white}
                    />
                    <Text className="font-semibold text-base text-white ml-2">
                        Confirmar
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}