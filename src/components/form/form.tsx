import { useState, type ChangeEvent } from "react";

interface IForm {
    email: string;
    name: string;
}

export default function Form() {
    const [formState, setFormState] = useState<IForm>({
        email: "",
        name: "",
    });

    const onHandleChange = (
        e: ChangeEvent<HTMLInputElement>,
        variable: keyof IForm,
    ) => {
        e.preventDefault();

        setFormState((prev) => ({
            ...prev,
            [variable]: e.target.value,
        }));
    };

    console.log("render");

    return (
        <>
            <form className="">
                {JSON.stringify(formState)}

                <div className="">
                    <label htmlFor="name">Name: </label>
                    <input
                        id="name"
                        type="text"
                        value={formState.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onHandleChange(e, "name")
                        }
                    />
                </div>
            </form>
        </>
    );
}
