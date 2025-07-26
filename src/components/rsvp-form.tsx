"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, PartyPopper, Frown } from "lucide-react"

import { handleRsvp } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const rsvpFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  attending: z.enum(["yes", "no"], {
    required_error: "Por favor, selecione se você irá ou não.",
  }),
})

type RsvpFormValues = z.infer<typeof rsvpFormSchema>

export function RsvpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; message: string; attending: 'yes' | 'no' } | null>(null)
  const { toast } = useToast()

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(data: RsvpFormValues) {
    setIsSubmitting(true)
    // Simula o processamento do lado do servidor sem realmente usar uma ação do servidor
    // Isso mantém o projeto estático e compatível com o plano gratuito.
    try {
      // A função `handleRsvp` é agora apenas um auxiliar de validação do lado do cliente
      const result = await handleRsvp(data)
      if (result.success) {
        setSubmissionResult({ 
          success: true, 
          message: `Obrigado por confirmar, ${data.name}!`,
          attending: data.attending as 'yes' | 'no',
        })
      } else {
        // Este caso idealmente não deveria acontecer devido à validação do lado do cliente
        toast({
          variant: "destructive",
          title: "Erro na confirmação",
          description: "Houve um problema ao enviar sua resposta. Verifique os campos e tente novamente.",
        })
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível processar sua resposta. Por favor, tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (submissionResult?.success) {
    return (
      <Card className="w-full max-w-lg text-center shadow-lg animate-in fade-in-50 duration-500 bg-primary/20 border-primary">
        <CardHeader>
          {submissionResult.attending === 'yes' ? (
            <PartyPopper className="mx-auto h-16 w-16 text-primary-foreground" />
          ) : (
            <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-2xl mb-2">Resposta Enviada!</CardTitle>
          <p className="text-muted-foreground">
            {submissionResult.attending === 'yes' 
              ? `Que ótimo! Mal podemos esperar para te ver, ${form.getValues('name')}!` 
              : `Que pena que você não poderá vir, ${form.getValues('name')}. Sentiremos sua falta!`}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg p-4 sm:p-8 shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Seu nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu nome" {...field} className="py-6 text-base"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attending"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg">Você vai?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1 border p-4 rounded-md has-[:checked]:bg-primary/20 has-[:checked]:border-primary transition-colors cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal text-base cursor-pointer">
                        Com certeza! Estarei lá!
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 flex-1 border p-4 rounded-md has-[:checked]:bg-muted has-[:checked]:border-foreground/50 transition-colors cursor-pointer">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal text-base cursor-pointer">
                        Infelizmente não poderei ir.
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              "Confirmar Presença"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  )
}
