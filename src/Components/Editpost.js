import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../Stylesheets/Createpost.css";
import { Alert, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditPostMutation } from "../ReduxState/appApi";
import { AiOutlineMinusCircle } from "react-icons/ai"
import { useSelector } from "react-redux";


function Editpost() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("")
    const [description, setDescription] = useState("");
    const [images, setImages] = useState(null)
    const [imgBtn, setImgBtn] = useState(true)
    const [removeImg, setRemoveImg] = useState(null)
    const user = useSelector((state) => state.user)




    const modules = {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],

            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],

            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["image", "link"],
            ["clean"],
        ],
    };

    const [editPost, { isLoading, isError, error, isSuccess }] = useEditPostMutation()


    async function getPosts() {
        let res = await fetch(`https://odd-cyan-chameleon-sock.cyclic.app/posts/${id}`)
        let data = await res.json()
        setTitle(data.title)
        setSummary(data.summary)
        setDescription(data.description)
        setImages(data.cover[0])

    }

    useEffect(() => {
        getPosts()
    }, [])


    function selectImg() {
        const cloudWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: "dmaqngqvx",
                uploadPreset: "uozi891b"
            },
            (err, result) => {
                if (!err && result.event === "success") {
                    setImages({ url: result.info.url, public_id: result.info.public_id })
                    setImgBtn(true)
                }
            }
        )
        cloudWidget.open()
    }

    async function deleteImage(deleteImg) {
        setRemoveImg(deleteImg.public_id);
        let res = await fetch(`https://odd-cyan-chameleon-sock.cyclic.app/images/${deleteImg.public_id}`, {
            method: "DELETE"
        })
        setRemoveImg(null);
        setImages(null);
        setImgBtn(false)
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title || !summary || !description || !images) {
            return alert("Kindly fill all details")
        }
        const userId = user._id
        const res = await editPost({ id, title, summary, description, images, userId })
        console.log(res);
        if (res.data.length > 0) {
            setTimeout(() => {
                navigate("/posts");
            }, 1500);
        }
    }
    return (
        <div>
            <div className="createContainer">
                <h3 className="text-center my-4">Edit Post</h3>
                {isSuccess && <Alert variant="success">Product updated successfully</Alert>}
                {isError && <Alert variant="danger">{error.data}</Alert>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title"
                        className="inputcontainer"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Summary"
                        className="inputcontainer"
                        name="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                    <br />
                    <ReactQuill
                        style={{ marginBottom: "20px" }}
                        modules={modules}
                        value={description}
                        onChange={(newVal) => setDescription(newVal)}
                    />
                    <br />

                    <Button type="button" onClick={selectImg} className="text-center" disabled={imgBtn}>Upload Cover Photo</Button>
                    <div className="previewContainer">
                        {imgBtn && (
                            <div className="imgPreview">
                                <img src={images?.url} alt="image" />
                                {removeImg != images?.public_id && <AiOutlineMinusCircle className="deleteImg" onClick={() => deleteImage(images)} />}
                            </div>
                        )}
                    </div>
                    <Button variant="dark" className="btnPost" type="submit" disabled={isLoading || isSuccess}>
                        Update
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Editpost;
