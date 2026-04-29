import { fireEvent, render, screen } from "@testing-library/svelte"
import { describe, expect, test } from "vitest"
import Terminal from "$lib/components/Terminal.svelte"

describe("Terminal", () => {
  test("renders intro state and focuses input", () => {
    render(Terminal)

    expect(screen.getByText("Welcome to kolchurin.dev terminal")).toBeInTheDocument()
    expect(screen.getByDisplayValue("")).toHaveFocus()
  })

  test("executes commands and appends output", async () => {
    render(Terminal)

    const input = screen.getByRole("textbox")

    await fireEvent.input(input, { target: { value: "help" } })
    await fireEvent.keyDown(input, { key: "Enter" })

    expect(screen.getByText(/Available commands:/)).toBeInTheDocument()

    await fireEvent.input(input, { target: { value: "cat skills.json" } })
    await fireEvent.keyDown(input, { key: "Enter" })

    expect(screen.getByText(/backend & databases/i)).toBeInTheDocument()
  })

  test("shows autocompletion suggestions and command errors", async () => {
    render(Terminal)

    const input = screen.getByRole("textbox")

    await fireEvent.input(input, { target: { value: "contact --" } })

    expect(screen.getByText("--email")).toBeInTheDocument()
    expect(screen.getByText("--phone")).toBeInTheDocument()

    await fireEvent.input(input, { target: { value: "wat" } })
    await fireEvent.keyDown(input, { key: "Enter" })

    expect(
      screen.getByText("wat: command not found. Type 'help' for available commands.")
    ).toBeInTheDocument()
  })
})
