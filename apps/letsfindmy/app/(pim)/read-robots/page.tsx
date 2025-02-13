"use client"

import { Container, TextInput, Paper, Title, Text, Code, Button, Flex, ScrollArea } from "@mantine/core"
import { useState } from "react"
import { fetchRobotsTxt } from "./actions"

export default function ReadRobots() {
    const [robotsTxt, setRobotsTxt] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await fetchRobotsTxt(formData)
            setRobotsTxt(result)
        } catch (error) {
            console.error("Error fetching robots.txt:", error)
            setRobotsTxt("Error: Failed to fetch robots.txt")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Container size="sm" py="lg">
            <form action={handleSubmit}>
                <Flex

                    gap="md"
                    justify="flex-start"
                    align="flex-end"
                    direction="row"
                    wrap="wrap">
                <TextInput
                    name="url"
                    label="Website URL"
                    placeholder="example.com"
                    description="Enter a domain name to fetch its robots.txt"

                    flex={1}
                    required
                    pattern="^([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}|https?:\/\/.+)$"
                />
                <Button type="submit" loading={isLoading}>
                    Fetch
                </Button>
                </Flex>
            </form>

            {robotsTxt && (
                <Paper withBorder p="md" mt="xl">
                    <Title order={3} mb="md">
                        robots.txt Content
                    </Title>

                    <ScrollArea w="100%">

                    <Code w={800} block style={{ whiteSpace: "pre-wrap" }}>
                        {robotsTxt}
                    </Code>
                    </ScrollArea>
                </Paper>
            )}

            {isLoading && (
                <Text mt="md" c="dimmed">
                    Loading robots.txt...
                </Text>
            )}
        </Container>
    )
}

