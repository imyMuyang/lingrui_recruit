import pandas as pd


def getTitle(name):
    return name.split(".")[0].split(",")[1].strip()


def checkVIP(title):
    match title:
        case (
            "Col"
            | "Jonkheer"
            | "Rev"
            | "Major"
            | "the Countess"
            | "Lady"
            | "Master"
            | "Capt"
            | "Dr"
        ):
            return 1
        case _:
            return 0


def checkMarried(title):
    match title:
        case "Mrs" | "Mme" | "Lady" | "the Countess":
            return 2
        case "Miss" | "Mlle":
            return 1
        case _:
            return 0


def proceedOrigin(path):
    data = pd.read_csv(path)
    print("读取到泰坦尼克号数据集，共", data.shape[0], "条乘客数据")
    print("填充空白年龄数据……")
    data["Age"] = data["Age"].fillna(data["Age"].median())
    print("填充空白船舱数据……")
    data["Cabin"] = data["Cabin"].fillna("Z")
    print("填充空白登船地数据……")
    data["Embarked"] = data["Embarked"].fillna(data["Embarked"].mode()[0])
    print("清除重复数据……")
    data.drop_duplicates()
    print("缺失数据和重复数据处理完毕")
    print("开始特征工程……")
    print("处理分类变量……")
    data["Sex"] = data["Sex"].map({"male": 0, "female": 1})
    data = pd.get_dummies(data, columns=["Embarked"], dtype=int)
    data["Title"] = data["Name"].map(getTitle)
    print("构造数据……")
    data["VIP"] = data["Title"].map(checkVIP)
    data["Married"] = data["Title"].map(checkMarried)
    data["Cabin"] = data["Cabin"].map(lambda s: s[0])  # type: ignore
    data = pd.get_dummies(data, columns=["Cabin"], dtype=int)
    data["Family"] = data["SibSp"] + data["Parch"] + 1
    print("清除不必要的数据……")
    data.drop(["Name", "Title", "Ticket", "SibSp", "Parch"], axis=1, inplace=True)
    # print(data.info())
    print("整理顺序……")
    data = data.reindex(
        columns=[
            "PassengerId",
            "Survived",
            "Pclass",
            "Sex",
            "Age",
            "Fare",
            "Embarked_C",
            "Embarked_Q",
            "Embarked_S",
            "VIP",
            "Married",
            "Cabin_A",
            "Cabin_B",
            "Cabin_C",
            "Cabin_D",
            "Cabin_E",
            "Cabin_F",
            "Cabin_G",
            "Cabin_T",
            "Cabin_Z",
            "Family",
        ],
        fill_value=0,
    )
    print("数据预处理完成！")
    data.to_csv("./data/data.csv", index=False)
    print("预处理完成的数据已经保存到本地！")
