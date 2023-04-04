import AdminHeader from "@/components/header/adminHeader";
import { BuildingComment, getAllBuildingComments } from "@/lib/building-comment";
import { EmailTemplate, getAllEmailTemplates } from "@/lib/communication";
import { Fragment, useEffect, useState } from "react";
import styles from 'styles/Welcome.module.css';
import cbstyles from 'styles/Combobox.module.css';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default function AdminCommunication() {
    const [loading, setLoading] = useState(true);
    const [allTemplates, setAllTemplates] = useState<EmailTemplate[]>([]);
    const [allComments, setAllComments] = useState<BuildingComment[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState({});
    const [selectedComment, setSelectedComment] = useState({});
    const [templateQuery, setTemplateQuery] = useState("");
    const [commentQuery, setCommentQuery] = useState("");
    
    const filteredTemplates =
        templateQuery === "" 
            ? allTemplates
            : allTemplates.filter((template) => {
                template.name
                    .toLowerCase()
                    .includes(templateQuery.toLowerCase());
            });
    const filteredComments = 
        commentQuery === "" 
            ? allComments
            : allComments.filter((comment) => {
                comment.comment
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(commentQuery.toLowerCase().replace(/\s+/g, ""));
            });

    useEffect(() => {
        getAllEmailTemplates().then(res => {
            const emailTemplates : EmailTemplate[] = res.data;
            setAllTemplates(emailTemplates);
            setSelectedTemplate({id: emailTemplates[0].id, name: emailTemplates[0].name});
        }, err => {
            console.error(err);
        });

        getAllBuildingComments().then(res => {
            const buildingComments : BuildingComment[] = res.data;
            setAllComments(buildingComments);
            setSelectedComment({id: buildingComments[0], name: buildingComments[0].comment});
        }, err => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        setLoading(false);
    }, [allTemplates, allComments, selectedTemplate, selectedComment]);


    return (
        <>
            <>
                <AdminHeader/>
                <p className={styles.title}>Communicatie extern</p>

                <Combobox value={selectedTemplate} onChange={setSelectedTemplate}>
                    <div className={cbstyles.comboboxContainer}>
                        <Combobox.Input
                        className={cbstyles.comboboxInput}
                        displayValue={(t: EmailTemplate) => t.name}
                        onChange={(event) => setTemplateQuery(event.target.value)}
                        />
                        <Combobox.Button className={cbstyles.comboboxButton}>
                            <ChevronUpDownIcon className={cbstyles.comboboxButtonIcon}
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setTemplateQuery('')}
                    >
                        <Combobox.Options className={cbstyles.comboboxOptions}>
                        {filteredTemplates.length === 0 && templateQuery !== '' ? (
                            <div>
                            Nothing found.
                            </div>
                        ) : (
                            filteredTemplates.map((t) => (
                            <Combobox.Option
                                key={t.id}
                                className={cbstyles.comboboxOption}
                                value={t}
                            >
                                {({ selected, active }) => (
                                <>
                                    <span
                                    className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                    }`}
                                    >
                                    {t.name}
                                    </span>
                                    {selected ? (
                                    <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                        }`}
                                    >
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />    
                                    </span>
                                    ) : null}
                                </>
                                )}
                            </Combobox.Option>
                            ))
                        )}
                        </Combobox.Options>
                    </Transition>
                </Combobox>
            </>
        </>
    );
}
